import { ClassSerializerInterceptor, INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import serverConfig from '@root/core/config/server.config';
import { AppModule } from './app.module';
import { CoreDefine } from './core/define/define';
import { ServerModule } from './server/server.module';
import { setupSwagger } from './swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  setAplication(app);

  if (serverConfig.serverType && serverConfig.serverType != CoreDefine.SERVER_TYPE.LIVE) {
    await setupSwagger(app, [AppModule, ServerModule], 'api');
  }
  await app.listen(3000);
}

function setAplication(app: INestApplication): void {
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // validation을 위한 decorator가 붙어있지 않은 속성들은 제거
      forbidNonWhitelisted: true, // whitelist 설정을 켜서 걸러질 속성이 있다면 아예 요청 자체를 막도록 (400 에러)
      transform: true, // 요청에서 넘어온 자료들의 형변환
      enableDebugMessages: true,
    }),
  );

  //종료 이벤트 시 app.close()
  process.on('SIGINT', () => {
    app.close().catch((err) => {
      console.error('close failed:', err);
      process.exit(1);
    });
  });
  process.on('SIGTERM', () => {
    app.close().catch((err) => {
      console.error('close failed:', err);
      process.exit(1);
    });
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
