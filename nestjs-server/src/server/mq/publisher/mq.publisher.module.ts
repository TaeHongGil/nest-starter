import { BullModule } from '@nestjs/bullmq';
import { Global, Module, OnModuleInit } from '@nestjs/common';
import { RedisService } from '@root/core/redis/redis.service';
import ServerLogger from '../../../core/server-logger/server.logger';
import { MQServiceModule } from './service/mq.service.module';

@Global()
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
    MQServiceModule,
  ],
  providers: [],
  exports: [MQServiceModule],
})
export class MQPublisherModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`MQPublisherModule.onModuleInit`);
  }
}
