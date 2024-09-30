import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import TestUtil from './core/utils/test.utils';

describe('AppController', () => {
  let app: NestExpressApplication;
  let module: TestingModule;
  let server: any;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await module.init();
    app = module.createNestApplication();
    app.enableCors();
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); // json to class

    await app.init();
    server = app.getHttpServer();
  });

  it('/', async () => {
    const result = await TestUtil.getAsync(server, '/');
    expect(result.status).toBe(200);
  });
});
