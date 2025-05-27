import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule } from '@root/core/core.module';
import { RedisService } from '@root/core/redis/redis.service';
import ServerLogger from '@root/core/server-log/server.logger';
import path from 'path';
import { BULL_QUEUES } from '../define/mq.define';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [RedisService],
      useFactory: async (redisService: RedisService) => {
        return {
          connection: redisService.getGlobalClient().options,
        };
      },
    }),
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
