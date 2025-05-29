import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import ServerConfig from '@root/core/config/server.config';
import { AuthGuard } from '@root/core/guard/auth.guard';
import ServerLogger from '@root/core/server-logger/server.logger';
import { ApiModule } from './api/api.module';
import { MQConsumerModule } from './mq/consumer/mq.consumer.module';
import { MQPublisherModule } from './mq/publisher/mq.publisher.module';
import { WsModule } from './ws/ws.module';

const importModules = [];
const providerModules = [];
const mode = ServerConfig.mode;

if (ServerConfig.server_info[mode]?.mq) {
  importModules.push(MQPublisherModule);
}

if (mode === 'api') {
  importModules.push(ApiModule);
  providerModules.push({
    provide: APP_GUARD,
    useClass: AuthGuard,
  });
} else if (mode === 'socket') {
  importModules.push(WsModule);
} else if (mode === 'mq') {
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
