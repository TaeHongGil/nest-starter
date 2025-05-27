import { BullModule } from '@nestjs/bullmq';
import { Global, Module, OnModuleInit } from '@nestjs/common';
import { RedisService } from '@root/core/redis/redis.service';
import { ServerLogger } from '@root/core/server-log/server.logger';

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
  ],
  providers: [],
  exports: [],
})
export class MQCoreModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`MQCoreModule.onModuleInit`);
  }
}
