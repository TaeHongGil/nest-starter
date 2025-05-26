import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule } from '@root/core/core.module';
import { BULL_QUEUES } from '@root/core/define/define';
import { ServerLogger } from '@root/core/server-log/server.logger';
import path from 'path';

@Module({
  imports: [
    BullModule.registerQueue(...BULL_QUEUES.map((name) => ({ name }))),
    CoreModule.registerDynamic(MQModule, path.join(__dirname, 'consumer'), '.consumer', 'providers'),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      ...BULL_QUEUES.map(
        (name): BullBoardQueueOptions => ({
          name,
          adapter: BullMQAdapter,
        }),
      ),
    ),
  ],
})
export class MQModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('MQModule.OnModuleInit');
  }
}
