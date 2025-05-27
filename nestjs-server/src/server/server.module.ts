import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import ServerConfig from '@root/core/config/server.config';
import { AuthGuard } from '@root/core/guard/auth.guard';
import { ServerLogger } from '@root/core/server-log/server.logger';
import { ApiModule } from './api/api.module';
import { MQConsumerModule } from './mq/consumer/mq.consumer.module';
import { WsModule } from './ws/ws.module';

const importModules = [];
const providerModules = [];

if (process.env.mode === 'api') {
  importModules.push(ApiModule);
  providerModules.push({
    provide: APP_GUARD,
    useClass: AuthGuard,
  });
} else if (process.env.mode === 'socket') {
  importModules.push(WsModule);
} else if (process.env.mode === 'mq') {
  importModules.push(MQConsumerModule);
}

@Module({
  imports: [ThrottlerModule.forRootAsync({ useFactory: async () => ServerConfig.throttler }), ...importModules],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ...providerModules,
  ],
  exports: [],
})
export class ServerModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`ServerModule.OnModuleInit`);
  }
}
