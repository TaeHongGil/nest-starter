import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'jsonwebtoken';
import ServerConfig from '../config/server.config';
import ServerError from '../error/server.error';
import CryptUtil from '../utils/crypt.utils';
import { SessionUser } from './auth.schema';
import { AuthService } from './auth.service';

/**
 * Auth Guard
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const jwtInfo = CryptUtil.jwtVerify(this.authService.getAuthToken(request), ServerConfig.jwt.key) as JwtPayload;
    if (!jwtInfo) {
      throw ServerError.INVALID_TOKEN;
    }
    const user: SessionUser = {
      useridx: jwtInfo['useridx'],
      role: jwtInfo['role'],
      nickname: jwtInfo['nickname'],
    };
    request.session = {
      user: user,
      request: request,
      response: response,
    };

    return true;
  }
}

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const token = this.authService.getAuthToken(request);
    let user: SessionUser;
    if (token) {
      const jwtInfo = CryptUtil.jwtVerify(token, ServerConfig.jwt.key) as JwtPayload;
      if (jwtInfo) {
        user = {
          useridx: jwtInfo['useridx'],
          role: jwtInfo['role'],
          nickname: jwtInfo['nickname'],
        };
      }
    }
    request.session = {
      user: user,
      request: request,
      response: response,
    };

    return true;
  }
}
