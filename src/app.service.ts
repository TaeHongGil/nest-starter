import { BeforeApplicationShutdown, Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from './core/server-log/server.log.service';

@Injectable()
export class AppService implements BeforeApplicationShutdown, OnApplicationShutdown, OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    ServerLogger.log(`onModuleInit`);
  }

  onApplicationBootstrap() {
    ServerLogger.log(`onApplicationBootstrap`);
  }

  onModuleDestroy() {
    ServerLogger.log(`onModuleDestroy`);
  }

  beforeApplicationShutdown() {
    ServerLogger.log(`beforeApplicationShutdown`);
  }

  onApplicationShutdown(signal: string) {
    ServerLogger.log(`onApplicationShutdown`);
  }
}
