import { Module, OnModuleInit } from '@nestjs/common';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BatchTestService } from '@root/server/batch/cron/test/batch.test.service';

@Module({
  imports: [],
  providers: [BatchTestService],
  exports: [BatchTestService],
})
export class BatchTestModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BatchTestModule.OnModuleInit`);
  }
}
