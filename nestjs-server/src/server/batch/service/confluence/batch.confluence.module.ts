import { Module, OnModuleInit } from '@nestjs/common';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BatchConfluenceService } from '@root/server/batch/service/confluence/batch.confluence.service';

@Module({
  imports: [],
  providers: [BatchConfluenceService],
  exports: [BatchConfluenceService],
})
export class BatchConfluenceModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BatchConfluenceModule.OnModuleInit`);
  }
}
