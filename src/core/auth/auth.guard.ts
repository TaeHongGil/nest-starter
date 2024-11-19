import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'jsonwebtoken';
import ServerConfig from '../config/server.config';
import { CUSTOM_METADATA, ROLE } from '../define/define';
import ServerError from '../error/server.error';
import CryptUtil from '../utils/crypt.utils';
import { SessionUser } from './auth.schema';
import { AuthService } from './auth.service';

/**
 *
 * @param verification 이메일 인증 여부 확인
 * @returns
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
    if (ServerConfig.session.active) {
      if (!request.session?.user) {
        throw ServerError.SESSION_NOT_FOUND;
      }
    } else if (ServerConfig.jwt.active) {
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
        cookie: undefined,
        user: user,
        request: request,
        response: response,
      };
    }

    const notVerifired = this.reflector.get<boolean>(CUSTOM_METADATA.NOT_VERIFIED, context.getHandler());
    if (ServerConfig.account.verification.active && !notVerifired && request.session.user?.role == ROLE.UNVERIFIED) {
      throw ServerError.EMAIL_VERIFICATION_ERROR;
    }

    return true;
  }
}

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (ServerConfig.jwt.active) {
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
        cookie: undefined,
        user: user,
        request: request,
        response: response,
      };
    }

    return true;
  }
}
