import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import ServerConfig from '@root/core/config/server.config';
import { AuthGuard } from '@root/core/guard/auth.guard';
import { ServerLogger } from '@root/core/server-log/server.logger';
import { CommonModule } from './common/common.module';
import { MQModule } from './mq/mq.module';
import { ProjectModule } from './project/project.module';
import { SocketModule } from './socket/socket.module';

const importModules = [];
const providerModules = [];

if (process.env.mode === 'api') {
  importModules.push(ThrottlerModule.forRootAsync({ useFactory: async () => ServerConfig.throttler }), CommonModule, ProjectModule);
  providerModules.push(
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  );
} else if (process.env.mode === 'socket') {
  importModules.push(SocketModule);
} else if (process.env.mode === 'mq') {
  importModules.push(MQModule);
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
