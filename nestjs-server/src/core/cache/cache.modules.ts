import { Global, Module, type OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '../server-log/server.logger';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('CacheModule.onModuleInit');
  }
}
