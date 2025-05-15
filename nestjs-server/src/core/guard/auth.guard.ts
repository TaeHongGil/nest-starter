import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'jsonwebtoken';
import { SessionUser } from '../auth/auth.schema';
import { AuthService } from '../auth/auth.service';
import ServerConfig from '../config/server.config';
import ServerError from '../error/server.error';
import CryptUtil from '../utils/crypt.utils';

@Injectable()
@SetMetadata('swagger/summary', '인증필요')
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const jwtInfo = CryptUtil.jwtVerify(this.authService.getRequestToken(request), ServerConfig.jwt.key) as JwtPayload;
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
@SetMetadata('swagger/summary', '미인증')
export class NoAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const token = this.authService.getRequestToken(request);
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
