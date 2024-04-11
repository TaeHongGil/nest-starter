import { Global, Module, type OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '../server-log/server.log.service';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('RedisModule.onModuleInit');
  }
}
