import { DynamicModule, Module, ModuleMetadata, type OnModuleInit } from '@nestjs/common';
import ServerLogger from '../server-logger/server.logger';
import { RedisIoAdapter } from './redis.adapter';
import { RedisService } from './redis.service';

@Module({})
export class RedisModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('RedisModule.onModuleInit');
  }

  static forRootAsync(options: ModuleMetadata = {}): DynamicModule {
    return {
      global: true,
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
