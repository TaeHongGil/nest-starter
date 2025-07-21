import { Injectable } from '@nestjs/common';
import { CustomCron } from '@root/core/decorator/common.decorator';
import ServerLogger from '@root/core/server-logger/server.logger';

@Injectable()
export class BatchTestService {
  @CustomCron('TEST')
  handleCron(): void {
    ServerLogger.log('EVERY_MINUTE');
  }
}
