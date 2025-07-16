import { HttpException, HttpStatus } from '@nestjs/common';

class CoreError {
  static get BAD_REQUEST(): HttpException {
    return new HttpException('bad request', HttpStatus.BAD_REQUEST);
  }

  static get NOT_FOUND(): HttpException {
    return new HttpException('not found', HttpStatus.NOT_FOUND);
  }

  static get FORBIDDEN(): HttpException {
    return new HttpException('forbidden error', HttpStatus.FORBIDDEN);
  }

  static get INVALID_TOKEN(): HttpException {
    return new HttpException('invalid or expired token', HttpStatus.UNAUTHORIZED);
  }

  static get INVALID_REFRESH_TOKEN(): HttpException {
    return new HttpException('invalid or expired refresh token', HttpStatus.UNAUTHORIZED);
  }

  static EXTERNAL_REQUEST_ERROR(message: string): HttpException {
    return new HttpException(message || 'external request error', HttpStatus.BAD_REQUEST);
  }
}

export default CoreError;
