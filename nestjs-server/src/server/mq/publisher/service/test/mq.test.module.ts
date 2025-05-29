import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BULL_QUEUES } from '@root/server/mq/define/mq.define';
import { MQTestService } from './mq.test.service';

@Module({
  imports: [BullModule.registerQueue({ name: BULL_QUEUES.TEST })],
  providers: [MQTestService],
  exports: [MQTestService],
})
export class MQTestModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`MQTestModule.OnModuleInit`);
  }
}
