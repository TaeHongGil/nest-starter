import { HttpException, HttpStatus } from '@nestjs/common';

class BatchError {
  static CRON_EXECUTE_FAILED(message: string): HttpException {
    return new HttpException(`cron job execution failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export default BatchError;
