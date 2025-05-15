import { Module, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '@root/core/server-log/server.log.service';
import { CommonModule } from './common/common.module';
import { ProjectModule } from './project/project.module';
import { SocketModule } from './socket/socket.module';

const importModules = [];

if (process.env.mode == 'socket') {
  importModules.push(SocketModule);
} else {
  importModules.push(CommonModule, ProjectModule);
}

@Module({
  imports: [...importModules],
  controllers: [],
  providers: [],
  exports: [],
})
export class ServerModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`ServerModule.OnModuleInit`);
  }
}
