import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ServerConfig from './core/config/server.config';
import { CoreModule } from './core/core.module';
import { FeatureModule } from './feature/feature.module';
import { ServerModule } from './server/server.module';

@Module({
  imports: [ThrottlerModule.forRootAsync({ useFactory: async () => ServerConfig.throttler }), CoreModule, ServerModule, FeatureModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule {}
