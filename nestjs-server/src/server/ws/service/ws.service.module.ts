import { Module, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '@root/core/server-log/server.logger';
import { ChatModule } from './chat/chat.module';

const importModules = [ChatModule];

@Module({
  imports: [...importModules],
  providers: [],
  exports: [...importModules],
})
export class WsServiceModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`SocketServiceModule.OnModuleInit`);
  }
}
