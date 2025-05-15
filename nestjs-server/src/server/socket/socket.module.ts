import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule } from '@root/core/core.module';
import { ServerLogger } from '@root/core/server-log/server.log.service';
import path from 'path';
import { ChatModule } from './service/chat/chat.module';

@Module({
  imports: [ChatModule, CoreModule.registerDynamic(SocketModule, path.join(__dirname, 'gateway'), '.gateway', 'providers')],
  providers: [],
})
export class SocketModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`SocketModule.OnModuleInit`);
  }
}
