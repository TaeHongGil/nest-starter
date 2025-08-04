import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import ServerLogger from '@root/core/server-logger/server.logger';
import { CustomCron } from '@root/server/batch/decorator/batch.decorator';

@Injectable()
export class BatchTestService {
  @CustomCron('TEST', CronExpression.EVERY_MINUTE)
  handleCron(): void {
    ServerLogger.log('EVERY_MINUTE');
  }
}
