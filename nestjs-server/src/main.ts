import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import ServerConfig from '@root/core/config/server.config';
import { SERVER_TYPE, ZONE_TYPE } from '@root/core/define/define';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { json } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './core/error/global.exception.filter';
import { GlobalValidationPipe } from './core/pipe/GlobalValidationPipe';
import { RedisIoAdapter } from './core/redis/redis.adapter';
import ServerLogger from './core/server-logger/server.logger';
import { ResponseInterceptor } from './server/api/common/interceptor/response.interceptor';
import { HttpMiddleware } from './server/api/common/middleware/http.middleware';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('UTC');

async function bootstrap(): Promise<void> {
  try {
    const server_type = ServerConfig.server_type;
    const port = ServerConfig.server_info[server_type].port;
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: new ServerLogger(),
    });

    app.enableVersioning();

    setHelmet(app);
    if (!server_type) {
      throw new Error('Invalid server type');
    }
    if (server_type == SERVER_TYPE.API) {
      await setAPIServer(app);
    } else if (server_type == SERVER_TYPE.SOCKET) {
      await setWsServer(app);
    } else if (server_type == SERVER_TYPE.MQ) {
      await setMQerver(app);
    }

    await app.listen(port);

    if (ServerConfig.zone == ZONE_TYPE.LOCAL) {
      const figlet = (await import('figlet')).default;
      figlet(ServerConfig.service.name.toUpperCase(), (err, data) => {
        if (err) {
          console.error('Figlet error:', err);

          return;
        }

        const appUrl = `http://localhost:${port}/`;
        process.stdout.write('\x1b[2J\x1b[0f');
        console.log('\x1b[36m%s\x1b[0m', data);
        console.log(`${server_type.toUpperCase()} Server is running on:\x1b[0m \x1b[32m${appUrl}\x1b[0m\n`);
      });
    }
  } catch (error) {
    ServerLogger.error(`Bootstrap error: ${error?.message}`, error?.stack);
  }
}

function setHelmet(app: NestExpressApplication): void {
  app.enableCors({
    origin: (origin, callback) => {
      const allowedPatterns = [/^http:\/\/localhost:\d+$/, /^https:\/\/localhost:\d+$/];
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
  app.use(json({ limit: '1mb' }));
  app.use(compression());

  if (ServerConfig.dev) {
    const { SwaggerService } = await import('./feature/swagger/swagger.service');
    const swagger = app.get(SwaggerService);
    await swagger.APIServerInit(app);
  }
}

async function setWsServer(app: NestExpressApplication): Promise<void> {
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  if (ServerConfig.dev) {
    const { SwaggerService } = await import('./feature/swagger/swagger.service');
    const swagger = app.get(SwaggerService);
    await swagger.SocketServerInit();
  }
}

async function setMQerver(app: NestExpressApplication): Promise<void> {}

bootstrap().catch((err) => {
  process.exit(1);
});
