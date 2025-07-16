import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoogleSheetService } from '@root/core/google/google.sheet.service';
import ServerLogger from '@root/core/server-logger/server.logger';
import { SHEET_ID } from '@root/server/batch/define/batch.define';
import { BatchGoogleRepository } from '@root/server/batch/service/google/batch.google.repository';

@Injectable()
export class BatchGoogleService {
  constructor(
    private readonly googleSheetService: GoogleSheetService,
    private readonly repository: BatchGoogleRepository,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'GOOGLE_SCHEDULE' })
  async handleCron(): Promise<any> {
    const sheetModifiedTime = await this.googleSheetService.getModifiedTime(SHEET_ID.TEST);
    const repositoryModifiedTime = await this.repository.getModifiedTimeAsync(SHEET_ID.TEST);

    if (!repositoryModifiedTime || new Date(sheetModifiedTime) > new Date(repositoryModifiedTime)) {
      await this.repository.setModifiedTimeAsync(SHEET_ID.TEST, sheetModifiedTime);
      ServerLogger.log('Sheet has more recent changes than the repository.');
    } else {
      ServerLogger.log('Repository is up-to-date with the sheet.');
    }
  }
}
