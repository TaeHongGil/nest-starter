import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import ServerLogger from '@root/core/server-logger/server.logger';

@Injectable()
export class BatchConfluenceService {
  @Cron(CronExpression.EVERY_MINUTE)
  handleCron(): void {
    ServerLogger.log('EVERY_MINUTE');
  }
}
