import { Module, OnModuleInit } from '@nestjs/common';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BatchGoogleModule } from '@root/server/batch/service/google/batch.google.module';
import { BatchTestModule } from '@root/server/batch/service/test/batch.test.module';

const importModules = [BatchTestModule, BatchGoogleModule];

@Module({
  imports: [...importModules],
  providers: [...importModules],
})
export class BatchServiceModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BatchServiceModule.OnModuleInit`);
  }
}
