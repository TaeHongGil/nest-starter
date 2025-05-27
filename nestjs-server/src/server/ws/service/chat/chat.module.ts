import { Module, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '@root/core/server-log/server.logger';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';

@Module({
  imports: [],
  providers: [ChatService, ChatRepository],
  exports: [ChatService],
})
export class ChatModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`ChatModule.OnModuleInit`);
  }
}
