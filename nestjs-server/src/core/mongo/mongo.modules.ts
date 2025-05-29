import { DynamicModule, Global, Module, ModuleMetadata, type OnModuleInit } from '@nestjs/common';
import ServerLogger from '../server-logger/server.logger';
import { MongoService } from './mongo.service';

@Global()
@Module({})
export class MongoModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('MongoModule.onModuleInit');
  }

  static forRootAsync(options: ModuleMetadata = {}): DynamicModule {
    return {
      module: MongoModule,
      imports: options.imports,
      providers: [
        ...(options.providers ?? []),
        MongoService,
        {
          provide: 'MONGO_INIT',
          inject: [MongoService],
          useFactory: async (mongoService: MongoService): Promise<void> => {
            await mongoService.onBeforeModuleInit();
          },
        },
      ],
      exports: [MongoService, ...(options.exports ?? [])],
    };
  }
}
