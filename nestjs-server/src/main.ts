import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import ServerConfig from '@root/core/config/server.config';
import cookieParser from 'cookie-parser';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './core/error/global.exception.filter';
import { ResponseInterceptor } from './core/interceptor/response.interceptor';
import { HttpMiddleware } from './core/middleware/http.middleware';
import { GlobalValidationPipe } from './core/pipe/GlobalValidationPipe';
import { RedisIoAdapter } from './core/redis/redis.adapter';
import { ServerLogger } from './core/server-log/server.log.service';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('UTC');

async function bootstrap(): Promise<void> {
  try {
    await ServerConfig.init();
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ServerLogger.instance,
    });

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: ServerConfig.mode == 'api' ? ServerConfig.version : undefined,
    });

    setHelmet(app);
    if (ServerConfig.mode == 'api') {
      await setAPIServer(app);
      await app.listen(ServerConfig.port.api);
    } else if (ServerConfig.mode == 'socket') {
      await setSocketServer(app);
      await app.listen(ServerConfig.port.socket);
    } else if (ServerConfig.mode == 'mq') {
      await setMQerver(app);
      await app.listen(ServerConfig.port.mq);
    } else {
      throw new Error('Invalid server mode');
    }

    if (ServerConfig.serverType == 'local') {
      const figlet = (await import('figlet')).default;
      figlet(ServerConfig.service.name.toUpperCase(), (err, data) => {
        if (err) {
          console.error('Figlet error:', err);

          return;
        }
        const port = ServerConfig.port[ServerConfig.mode];
        const mode = ServerConfig.mode.toUpperCase();
        const version = ServerConfig.mode == 'api' ? `v${ServerConfig.version}` : '';

        const appUrl = `http://localhost:${port}/${version}`;
        process.stdout.write('\x1b[2J\x1b[0f');
        console.log('\x1b[36m%s\x1b[0m', data);
        console.log(`${mode} Server is running on:\x1b[0m \x1b[32m${appUrl}\x1b[0m\n`);
      });
    }
  } catch (error) {
    ServerLogger.error('Bootstrap error:', error?.message);
    ServerLogger.error('Bootstrap error stack:', error?.stack);
  }
}

function setHelmet(app: NestExpressApplication): void {
  app.enableCors({
    origin: (origin, callback) => {
      const allowedPatterns = [/^http:\/\/localhost:\d+$/, /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/];
      if (!origin) {
        callback(null, true);

        return;
      }
      if (allowedPatterns.some((pattern) => pattern.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  });
  app.use(helmet());
}

async function setAPIServer(app: NestExpressApplication): Promise<void> {
  const reflector = app.get(Reflector);
  app.use(new HttpMiddleware().use);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalPipes(new GlobalValidationPipe());
  app.use(cookieParser());

  if (ServerConfig.dev) {
    const { SwaggerService } = await import('./feature/swagger/swagger.service');
    const swagger = app.get(SwaggerService);
    await swagger.APIServerInit(app);
  }
}

async function setSocketServer(app: NestExpressApplication): Promise<void> {
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  if (ServerConfig.dev) {
    const { SwaggerService } = await import('./feature/swagger/swagger.service');
    const swagger = app.get(SwaggerService);
    await swagger.SocketServerInit();
  }
}

async function setMQerver(app: NestExpressApplication): Promise<void> {}

bootstrap().catch((err) => {
  ServerLogger.error('Bootstrap failed:', err);
  process.exit(1);
});
