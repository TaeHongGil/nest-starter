import { BadRequestException, ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import serverConfig from '@root/core/config/server.config';
import { ValidationError } from 'class-validator';
import RedisStore from 'connect-redis';
import session from 'express-session';
import helmet from 'helmet';
import { createClient } from 'redis';
import { AppModule } from './app.module';
import { CoreRedisKeys } from './core/define/core.redis.key';
import { CoreDefine } from './core/define/define';
import { GlobalExceptionsFilter } from './core/error/GlobalExceptionsFilter';
import { ServerModule } from './server/server.module';
import { SwaggerOptions, setupSwagger } from './swagger/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setHelmet(app);
  setAplication(app);
  await setSessionAsync(app);
  await setSwagger(app);

  await app.listen(serverConfig.port);
}

async function setSwagger(app: NestExpressApplication): Promise<void> {
  if (serverConfig.dev === false) {
    return;
  }

  const options: SwaggerOptions = {
    includeModules: [AppModule, ServerModule],
    config: {
      token: {
        api: 'account/login',
        body: 'accessToken',
      },
    },
  };
  await setupSwagger(app, options);
}

function setHelmet(app: INestApplication): void {
  if (serverConfig.dev === false) {
    app.use(helmet());
    app.use(
      helmet.hsts({
        maxAge: CoreDefine.ONE_DAY_SECS * 180, // 180일
        includeSubDomains: true, // 모든 하위 도메인이 HSTS 정책을 따르도록 설정
        preload: true, // 브라우저의 사전 로드 목록에 사이트를 등록,
      }),
    );
  }
}

function setAplication(app: INestApplication): void {
  const callError = (validationErrors: ValidationError[] = []): Error => {
    let msg = '';
    for (const error of validationErrors) {
      msg = JSON.stringify(error.constraints);
      break;
    }
    return new BadRequestException(msg);
  };
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new GlobalExceptionsFilter());
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

async function setSessionAsync(app: INestApplication): Promise<void> {
  if (!serverConfig.session.active) {
    return;
  }
  const db = serverConfig.session.redis;
  const ttl = serverConfig.session.ttl;
  let redisStore = undefined;

  if (db && db.active) {
    const protocol = db.tls === true ? 'rediss' : 'redis';
    const redisClientOptions = {
      url: `${protocol}://${db.host}:${db.port}`,
      username: db.user_name,
      password: db.password,
      database: db.db,
    };
    const redisClient = createClient(redisClientOptions);
    await redisClient.connect();
    redisStore = new RedisStore({
      client: redisClient,
      prefix: CoreRedisKeys.getSessionDefaultKey(),
      ttl: ttl,
    });
  }
  app.use(
    session({
      store: redisStore,
      secret: serverConfig.session.key,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: serverConfig.session.secure,
        maxAge: ttl,
      },
    }),
  );
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
