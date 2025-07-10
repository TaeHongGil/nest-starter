import { Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BatchServiceModule } from '@root/server/batch/service/batch.service.module';

@Module({
  imports: [ScheduleModule.forRoot(), BatchServiceModule],
  providers: [],
})
export class BatchModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BatchModule.OnModuleInit`);
  }
}
