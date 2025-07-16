import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import ServerLogger from '@root/core/server-logger/server.logger';

@Injectable()
export class BatchTestService {
  @Cron(CronExpression.EVERY_MINUTE, { name: 'TEST' })
  handleCron(): void {
    ServerLogger.log('EVERY_MINUTE');
  }
}
