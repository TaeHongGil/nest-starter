import { DynamicModule, FactoryProvider, Module, ModuleMetadata, type OnModuleInit } from '@nestjs/common';
import ServerLogger from '../server-logger/server.logger';
import { SlackService } from './slack.service';

interface SlackModuleOptions {
  token?: string;
}

interface RootOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<SlackModuleOptions> | SlackModuleOptions;
  inject?: FactoryProvider['inject'];
}

@Module({})
export class SlackModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('SlackModule.onModuleInit');
  }

  static forRootAsync(options: RootOptions): DynamicModule {
    return {
      global: true,
      module: SlackModule,
      imports: options.imports || [],
      providers: [
        {
          provide: SlackService,
          useFactory: async (...args: any[]) => {
            const config = options.useFactory ? await options.useFactory(...args) : {};
            const slackService = new SlackService(config.token || '');

            return slackService;
          },
          inject: options.inject || [],
        },
      ],
      exports: [SlackService],
    };
  }
}
