import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from '@root/core/core.module';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BatchCronModule } from '@root/server/batch/cron/batch.cron.module';
import path from 'path';

/**
 * Batch 모듈
 * 필요시 별도로 추가하여 사용
 */
@Module({
  imports: [ScheduleModule.forRoot(), BatchCronModule, CoreModule.registerDynamic(BatchModule, path.join(__dirname, 'controller'), '.controller', 'controllers')],
  providers: [],
})
export class BatchModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BatchModule.OnModuleInit`);
  }
}
