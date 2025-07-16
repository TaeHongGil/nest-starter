import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from '@root/core/core.module';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BatchServiceModule } from '@root/server/batch/service/batch.service.module';
import path from 'path';

/**
 * Batch 모듈
 * 필요시 별도로 추가하여 사용
 */
@Module({
  imports: [ScheduleModule.forRoot(), BatchServiceModule, CoreModule.registerDynamic(BatchModule, path.join(__dirname, 'controller'), '.controller', 'controllers')],
  providers: [],
})
export class BatchModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BatchModule.OnModuleInit`);
  }
}
