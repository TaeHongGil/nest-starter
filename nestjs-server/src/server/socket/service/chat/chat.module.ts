import { Module, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '@root/core/server-log/server.log.service';
import { ChatRepository } from './chat.repository';

@Module({
  imports: [],
  providers: [ChatModule, ChatRepository],
  exports: [ChatModule],
})
export class ChatModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`ChatModule.OnModuleInit`);
  }
}
