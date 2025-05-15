import { Global, Module, type OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '../server-log/server.log.service';
import { RedisIoAdapter } from './redis.adapter';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [],
  providers: [RedisService, RedisIoAdapter],
  exports: [RedisService, RedisIoAdapter],
})
export class RedisModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('RedisModule.onModuleInit');
  }
}
