import { DynamicModule, Global, Module, ModuleMetadata, type OnModuleInit } from '@nestjs/common';
import { RedisIoAdapter } from '../redis/redis.adapter';
import { RedisService } from '../redis/redis.service';
import ServerLogger from '../server-logger/server.logger';

@Global()
@Module({})
export class RedisModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('RedisModule.onModuleInit');
  }

  static forRootAsync(options: ModuleMetadata = {}): DynamicModule {
    return {
      module: RedisModule,
      imports: options.imports,
      providers: [
        ...(options.providers ?? []),
        RedisService,
        RedisIoAdapter,
        {
          provide: 'REDIS_INIT',
          inject: [RedisService],
          useFactory: async (redisService: RedisService): Promise<void> => {
            await redisService.onBeforeModuleInit();
          },
        },
      ],
      exports: [RedisService, RedisIoAdapter, ...(options.exports ?? [])],
    };
  }
}
