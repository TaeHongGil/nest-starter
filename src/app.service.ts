import { BeforeApplicationShutdown, Injectable, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from './core/server-log/server.log.service';

@Injectable()
export class AppService implements BeforeApplicationShutdown, OnApplicationShutdown, OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`onModuleInit`);
  }

  async onApplicationBootstrap(): Promise<void> {
    ServerLogger.log(`onApplicationBootstrap`);
  }

  async onModuleDestroy(): Promise<void> {
    ServerLogger.log(`onModuleDestroy`);
  }

  async beforeApplicationShutdown(): Promise<void> {
    ServerLogger.log(`beforeApplicationShutdown`);
  }

  async onApplicationShutdown(signal: string): Promise<void> {
    ServerLogger.log(`onApplicationShutdown`);
  }
}
