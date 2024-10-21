import { BadRequestException, ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import ServerConfig from '@root/core/config/server.config';
import { ValidationError } from 'class-validator';
import RedisStore from 'connect-redis';
import session from 'express-session';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { CoreRedisKeys } from './core/define/core.redis.key';
import { CoreDefine } from './core/define/define';
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
  app.use(helmet());
  app.use(
    helmet.hsts({
      maxAge: CoreDefine.ONE_DAY_SECS * 180, // 180일
      includeSubDomains: true, // 모든 하위 도메인이 HSTS 정책을 따르도록 설정
      preload: true, // 브라우저의 사전 로드 목록에 사이트를 등록,
    }),
  );
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
