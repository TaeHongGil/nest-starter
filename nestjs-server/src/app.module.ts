import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { FeatureModule } from './feature/feature.module';
import { ServerModule } from './server/server.module';

@Module({
  imports: [CoreModule, ServerModule, FeatureModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
