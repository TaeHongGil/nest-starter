import { HttpException, HttpStatus } from '@nestjs/common';

export class ServerError {
  static readonly CONFIG_NOT_ACTIVE = new HttpException('config not active', HttpStatus.METHOD_NOT_ALLOWED);
  static readonly UUID_NOT_FOUND = new HttpException('uuid not found', HttpStatus.NOT_FOUND);
  static readonly SESSION_NOT_FOUND = new HttpException('session not found', HttpStatus.NOT_FOUND);
  static readonly USER_NOT_FOUND = new HttpException('user not found', HttpStatus.NOT_FOUND);
  static readonly PASSWORD_ERROR = new HttpException('password error', HttpStatus.BAD_REQUEST);
  static readonly MAIL_ERROR = new HttpException('unable to send mail', HttpStatus.NOT_FOUND);
  static readonly INVALID_TOKEN = new HttpException('invalid or expired token', HttpStatus.UNAUTHORIZED);
  static readonly TOKEN_NOT_FOUND = new HttpException('token not found', HttpStatus.NOT_FOUND);
  static readonly RESPONSE_ERROR = new HttpException(`http response error`, HttpStatus.BAD_REQUEST);
  static readonly DUPLICATED_ID = new HttpException('duplicated id', HttpStatus.CONFLICT);
  static readonly DUPLICATED_EMAIL = new HttpException('duplicated email', HttpStatus.CONFLICT);
  static readonly PLATFORM_LOGIN_FAILED = new HttpException('platform login failed', HttpStatus.BAD_REQUEST);
  static readonly TOO_MANY_REQUEST = new HttpException('too many reuqest', HttpStatus.TOO_MANY_REQUESTS);
  static readonly EMAIL_VERIFICATION_ERROR = new HttpException('email verification error', HttpStatus.FORBIDDEN);
  static readonly EMAIL_ALREADY_VERIFIED = new HttpException('email already verified', HttpStatus.BAD_REQUEST);
}
