import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { FeatureModule } from './feature/feature.module';
import { ServerModule } from './server/server.module';

@Module({
  imports: [CoreModule, ServerModule, FeatureModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
