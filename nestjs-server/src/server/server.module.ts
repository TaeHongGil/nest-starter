import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import ServerConfig from '@root/core/config/server.config';
import { SERVER_TYPE } from '@root/core/define/core.define';
import ServerLogger from '@root/core/server-logger/server.logger';
import { AuthGuard } from '@root/server/api/common/guard/auth.guard';
import { BatchModule } from '@root/server/batch/batch.module';
import { ApiModule } from './api/api.module';
import { MQConsumerModule } from './mq/consumer/mq.consumer.module';
import { WsModule } from './ws/ws.module';

const importModules = [];
const providerModules = [];
const server_type = ServerConfig.server_type;

if (server_type === SERVER_TYPE.API) {
  importModules.push(ApiModule);
  providerModules.push({
    provide: APP_GUARD,
    useClass: AuthGuard,
  });
} else if (server_type === SERVER_TYPE.BATCH) {
  importModules.push(BatchModule);
  providerModules.push({
    provide: APP_GUARD,
    useClass: AuthGuard,
  });
} else if (server_type === SERVER_TYPE.SOCKET) {
  importModules.push(WsModule);
} else if (server_type === SERVER_TYPE.MQ) {
  importModules.push(MQConsumerModule);
}

@Module({
  imports: [...importModules],
  controllers: [],
  providers: [...providerModules],
  exports: [],
})
export class ServerModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`ServerModule.OnModuleInit`);
  }
}
