import { HttpException, HttpStatus } from '@nestjs/common';

class ApiError {
  static get USER_NOT_FOUND(): HttpException {
    return new HttpException('user not found', HttpStatus.NOT_FOUND);
  }

  static get PLATFORM_LOGIN_FAILED(): HttpException {
    return new HttpException('platform login failed', HttpStatus.BAD_REQUEST);
  }
}

export default ApiError;
