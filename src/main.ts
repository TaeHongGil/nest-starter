import { BadRequestException, ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import ServerConfig from '@root/core/config/server.config';
import { ValidationError } from 'class-validator';
import RedisStore from 'connect-redis';
import session from 'express-session';
import { AppModule } from './app.module';
import { CoreRedisKeys } from './core/define/core.redis.key';
import { GlobalExceptionsFilter } from './core/error/GlobalExceptionsFilter';
import { ResponseInterceptor } from './core/interceptor/response.interceptor';
import { MongoService } from './core/mongo/mongo.service';
import { MysqlService } from './core/mysql/mysql.service';
import { RedisService } from './core/redis/redis.service';
import { ServerLogger } from './core/server-log/server.log.service';
import { SwaggerService } from './feature/swagger/swagger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  await ServerConfig.init();
  global.ServerConfig = ServerConfig;
  const { redisService, mongoService, mysqlService } = await onBeforeModuleInit(app);
  setHelmet(app);
  setAplication(app);
  await setSessionAsync(app, redisService);
  await app.listen(ServerConfig.port);
}

async function onBeforeModuleInit(app: NestExpressApplication): Promise<{ redisService: RedisService; mongoService: MongoService; mysqlService: MysqlService }> {
  const redisService = app.get(RedisService);
  const mongoService = app.get(MongoService);
  const mysqlService = app.get(MysqlService);
  await redisService.onBeforeModuleInit();
  await mongoService.onBeforeModuleInit();
  await mysqlService.onBeforeModuleInit();

  if (ServerConfig.dev) {
    const swagger = app.get(SwaggerService);
    await swagger.onBeforeModuleInit(app);
  }

  return { redisService, mongoService, mysqlService };
}

function setHelmet(app: NestExpressApplication): void {
  if (ServerConfig.dev === true) {
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

function setAplication(app: NestExpressApplication): void {
  const callError = (validationErrors: ValidationError[] = []): Error => {
    let msg = '';
    for (const error of validationErrors) {
      msg = JSON.stringify(error.constraints);
      break;
    }

    return new BadRequestException(msg);
  };
  const reflector = app.get(Reflector);
  app.useStaticAssets(ServerConfig.paths.ui.public);
  app.setBaseViewsDir(ServerConfig.paths.ui.view);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // validation을 위한 decorator가 붙어있지 않은 속성들은 제거
      forbidNonWhitelisted: true, // whitelist 설정을 켜서 걸러질 속성이 있다면 아예 요청 자체를 막도록 (400 에러)
      transform: true, // 요청에서 넘어온 자료들의 형변환
      enableDebugMessages: true,
      exceptionFactory: callError,
    }),
  );
}

async function setSessionAsync(app: NestExpressApplication, redisService: RedisService): Promise<void> {
  if (!ServerConfig.session.active) {
    return;
  }
  const redisClustering = ServerConfig.session.redis_clustering;
  const db = ServerConfig.db.redis;
  const ttl = ServerConfig.session.ttl;
  let redisStore = undefined;

  if (redisClustering && db) {
    const redisClient = redisService.getGlobalClient();
    redisStore = new RedisStore({
      client: redisClient,
      prefix: CoreRedisKeys.getSessionDefaultKey(),
      ttl: ttl,
    });
  }
  app.use(
    session({
      store: redisStore,
      secret: ServerConfig.session.secret_key,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: ServerConfig.session.secure,
        maxAge: ttl,
      },
    }),
  );
}

bootstrap().catch((err) => {
  ServerLogger.error('Bootstrap failed:', err);
  process.exit(1);
});
