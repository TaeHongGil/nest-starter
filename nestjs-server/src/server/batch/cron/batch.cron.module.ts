import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BatchCronRepository } from '@root/server/batch/cron/batch.cron.repository';
import { BatchCronService } from '@root/server/batch/cron/batch.cron.service';
import { BatchTestModule } from '@root/server/batch/cron/test/batch.test.module';

@Module({
  imports: [DiscoveryModule, BatchTestModule],
  providers: [BatchCronService, BatchCronRepository],
  exports: [BatchCronService],
})
export class BatchCronModule {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BatchCronModule.OnModuleInit`);
  }
}
