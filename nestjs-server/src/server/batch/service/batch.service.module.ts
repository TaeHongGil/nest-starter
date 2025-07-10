import { Module, OnModuleInit } from '@nestjs/common';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BatchConfluenceModule } from '@root/server/batch/service/confluence/batch.confluence.module';

const importModules = [BatchConfluenceModule];

@Module({
  imports: [...importModules],
  providers: [...importModules],
})
export class BatchServiceModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BatchServiceModule.OnModuleInit`);
  }
}
