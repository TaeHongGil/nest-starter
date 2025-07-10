import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import ServerConfig from '@root/core/config/server.config';
import ServerLogger from '@root/core/server-logger/server.logger';
import { AuthGuard } from '@root/server/api/common/guard/auth.guard';
import { BatchModule } from '@root/server/batch/batch.module';
import { ApiModule } from './api/api.module';
import { MQConsumerModule } from './mq/consumer/mq.consumer.module';
import { MQPublisherModule } from './mq/publisher/mq.publisher.module';
import { WsModule } from './ws/ws.module';

const importModules = [];
const providerModules = [];
const server_type = ServerConfig.server_type;

if (ServerConfig.server_info[server_type]?.mq) {
  importModules.push(MQPublisherModule);
}

if (server_type === 'api') {
  importModules.push(ApiModule);
  providerModules.push({
    provide: APP_GUARD,
    useClass: AuthGuard,
  });
} else if (server_type === 'socket') {
  importModules.push(WsModule);
} else if (server_type === 'mq') {
  importModules.push(MQConsumerModule);
} else if (server_type === 'batch') {
  importModules.push(BatchModule);
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
