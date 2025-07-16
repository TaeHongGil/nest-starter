import { Module, OnModuleInit } from '@nestjs/common';
import ServerLogger from '@root/core/server-logger/server.logger';
import { BatchGoogleRepository } from '@root/server/batch/service/google/batch.google.repository';
import { BatchGoogleService } from '@root/server/batch/service/google/batch.google.service';

@Module({
  imports: [],
  providers: [BatchGoogleRepository, BatchGoogleService],
  exports: [BatchGoogleService],
})
export class BatchGoogleModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`BatchGoogleModule.OnModuleInit`);
  }
}
