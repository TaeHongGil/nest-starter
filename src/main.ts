import { NestFactory } from '@nestjs/core';
import serverConfig from '@root/core/config/server.config';
import { AppModule } from './app.module';
import { CoreDefine } from './core/define/define';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (serverConfig.serverType && serverConfig.serverType != CoreDefine.SERVER_TYPE.LIVE) {
    await setupSwagger(app, AppModule, 'api');
  }
  await app.listen(3000);
}

bootstrap();
