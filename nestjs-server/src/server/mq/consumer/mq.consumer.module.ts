import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule } from '@root/core/core.module';
import { ServerLogger } from '@root/core/server-log/server.logger';
import path from 'path';
import { BULL_QUEUES } from '../define/mq.define';
import { MQCoreModule } from '../mq.core.module';

@Module({
  imports: [
    MQCoreModule,
    BullModule.registerQueue(...Object.values(BULL_QUEUES).map((name) => ({ name }))),
    CoreModule.registerDynamic(MQConsumerModule, path.join(__dirname, 'consumer'), '.consumer', 'providers'),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      ...Object.values(BULL_QUEUES).map(
        (name): BullBoardQueueOptions => ({
          name,
          adapter: BullMQAdapter,
        }),
      ),
    ),
  ],
})
export class MQConsumerModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('MQConsumerModule.OnModuleInit');
  }
}
