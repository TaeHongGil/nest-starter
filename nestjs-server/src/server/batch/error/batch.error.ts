import { HttpException, HttpStatus } from '@nestjs/common';

class BatchError {
  static CRON_EXECUTE_FAILED(message: string): HttpException {
    return new HttpException(`cron job execution failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static CRON_UPDATE_FAILED(message: string): HttpException {
    return new HttpException(`cron job update failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static EMPTY_EXTERNAL_STORAGE_ID(key: string): HttpException {
    return new HttpException(`target_id is empty: ${key}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export default BatchError;
