import { BullModule } from '@nestjs/bullmq';
import { Global, Module, OnModuleInit } from '@nestjs/common';
import { BULL_QUEUES } from '../define/define';
import { ServerLogger } from '../server-log/server.logger';
import { BullMQService } from './bull.mq.service';

@Global()
@Module({
  imports: [BullModule.registerQueue(...BULL_QUEUES.map((name) => ({ name })))],
  providers: [BullMQService],
  exports: [BullMQService],
})
export class BullMQModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BullMQModule.onModuleInit`);
  }
}
