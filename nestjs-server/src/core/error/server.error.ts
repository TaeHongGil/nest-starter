import { HttpException, HttpStatus } from '@nestjs/common';

class ServerError {
  static get BAD_REQUEST(): HttpException {
    return new HttpException('bad request', HttpStatus.BAD_REQUEST);
  }

  static get NOT_FOUND(): HttpException {
    return new HttpException('not found', HttpStatus.NOT_FOUND);
  }

  static get CONFIG_NOT_ACTIVE(): HttpException {
    return new HttpException('config not active', HttpStatus.METHOD_NOT_ALLOWED);
  }

  static get UUID_NOT_FOUND(): HttpException {
    return new HttpException('uuid not found', HttpStatus.NOT_FOUND);
  }

  static get SESSION_NOT_FOUND(): HttpException {
    return new HttpException('session not found', HttpStatus.NOT_FOUND);
  }

  static get USER_NOT_FOUND(): HttpException {
    return new HttpException('user not found', HttpStatus.NOT_FOUND);
  }

  static get PASSWORD_ERROR(): HttpException {
    return new HttpException('password error', HttpStatus.BAD_REQUEST);
  }

  static get INVALID_TOKEN(): HttpException {
    return new HttpException('invalid or expired token', HttpStatus.UNAUTHORIZED);
  }

  static get TOKEN_NOT_FOUND(): HttpException {
    return new HttpException('token not found', HttpStatus.NOT_FOUND);
  }

  static get RESPONSE_ERROR(): HttpException {
    return new HttpException('http response error', HttpStatus.BAD_REQUEST);
  }

  static get DUPLICATED_ID(): HttpException {
    return new HttpException('duplicated id', HttpStatus.CONFLICT);
  }

  static get PLATFORM_LOGIN_FAILED(): HttpException {
    return new HttpException('platform login failed', HttpStatus.BAD_REQUEST);
  }

  static get TOO_MANY_REQUEST(): HttpException {
    return new HttpException('too many requests', HttpStatus.TOO_MANY_REQUESTS);
  }

  static get MONGO_CONNECTION_NOT_FOUND(): HttpException {
    return new HttpException('MongoDB connection not found', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static get MONGO_SESSION_NOT_FOUND(): HttpException {
    return new HttpException('MongoDB session not found', HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static get MONGO_COMMIT_FAILED(): HttpException {
    return new HttpException('MongoDB commit failed', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export default ServerError;
