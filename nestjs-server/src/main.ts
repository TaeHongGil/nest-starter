import { ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import ServerConfig from '@root/core/config/server.config';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './core/error/global.exception.filter';
import { ResponseInterceptor } from './core/interceptor/response.interceptor';
import { MongoService } from './core/mongo/mongo.service';
import { GlobalValidationPipe } from './core/pipe/GlobalValidationPipe';
import { RedisIoAdapter } from './core/redis/redis.adapter';
import { RedisService } from './core/redis/redis.service';
import { ServerLogger } from './core/server-log/server.log.service';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('UTC');

async function bootstrap(): Promise<void> {
  try {
    await ServerConfig.init();

    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: ServerConfig.mode != 'socket' ? ServerConfig.version : undefined,
    });
    await onBeforeModuleInit(app);
    setHelmet(app);
    if (ServerConfig.mode == 'socket') {
      await setSocketServer(app);
      await app.listen(ServerConfig.port.socket);
    } else {
      await setAPIServer(app);
      await app.listen(ServerConfig.port.http);
    }

    if (ServerConfig.serverType == 'local') {
      const figlet = (await import('figlet')).default;
      figlet(ServerConfig.service.name.toUpperCase(), (err, data) => {
        if (err) {
          console.error('Figlet error:', err);

          return;
        }
        const port = ServerConfig.mode == 'socket' ? ServerConfig.port.socket : ServerConfig.port.http;
        const mode = ServerConfig.mode == 'socket' ? 'Socket' : 'API';
        const version = ServerConfig.mode == 'socket' ? '' : `v${ServerConfig.version}`;

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

async function onBeforeModuleInit(app: NestExpressApplication): Promise<{ redisService: RedisService; mongoService: MongoService }> {
  const redisService = app.get(RedisService);
  const mongoService = app.get(MongoService);
  await redisService.onBeforeModuleInit();
  await mongoService.onBeforeModuleInit();

  return { redisService, mongoService };
}

function setHelmet(app: NestExpressApplication): void {
  if (ServerConfig.dev === true) {
    app.enableCors({
      origin: '*',
    });

    return;
  }
  /**
   * https://inpa.tistory.com/entry/NODE-%EB%B3%B4%EC%95%88-%F0%9F%93%9A-helmet-%EB%AA%A8%EB%93%88-%EC%82%AC%EC%9A%A9%EB%B2%95-%EC%9B%B9-%EB%B3%B4%EC%95%88%EC%9D%80-%EB%82%B4%EA%B0%80-%F0%9F%91%AE#helmet_default
   */
  // app.use(helmet.crossOriginEmbedderPolicy());
  // app.use(helmet.crossOriginOpenerPolicy());
  // app.use(helmet.crossOriginResourcePolicy());
  // app.use(helmet.originAgentCluster());
  // app.use(helmet.referrerPolicy());
  // app.use(helmet.strictTransportSecurity());
  // app.use(helmet.xContentTypeOptions());
  // app.use(helmet.xDnsPrefetchControl());
  // app.use(helmet.xDownloadOptions());
  // app.use(helmet.xFrameOptions());
  // app.use(helmet.xPermittedCrossDomainPolicies());
  // app.use(helmet.xPoweredBy());
  // app.use(helmet.xXssProtection());
  // app.use(helmet.dnsPrefetchControl());
  // app.use(helmet.frameguard());
  // app.use(helmet.hidePoweredBy());
  // app.use(helmet.hsts());
  // app.use(helmet.ieNoOpen());
  // app.use(helmet.noSniff());
  // app.use(helmet.permittedCrossDomainPolicies());
  // app.use(helmet.xssFilter());
}

async function setAPIServer(app: NestExpressApplication): Promise<void> {
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalPipes(new GlobalValidationPipe());

  if (ServerConfig.dev) {
    const { SwaggerService } = await import('./feature/swagger/swagger.service');
    const swagger = app.get(SwaggerService);
    await swagger.APIServerInit(app);
  }
}

/**
 * useGlobal 사용이 불가하여 직접 설정
 */
async function setSocketServer(app: NestExpressApplication): Promise<void> {
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  if (ServerConfig.dev) {
    const { SwaggerService } = await import('./feature/swagger/swagger.service');
    const swagger = app.get(SwaggerService);
    await swagger.SocketServerInit();
  }
}

bootstrap().catch((err) => {
  ServerLogger.error('Bootstrap failed:', err);
  process.exit(1);
});
