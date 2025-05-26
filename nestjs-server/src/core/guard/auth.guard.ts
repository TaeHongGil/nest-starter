import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from 'jsonwebtoken';
import { SessionUser } from '../auth/auth.schema';
import { AuthService } from '../auth/auth.service';
import ServerConfig from '../config/server.config';
import ServerError from '../error/server.error';
import CryptUtil from '../utils/crypt.utils';

export const IS_PUBLIC_KEY = 'isPublic';

export function NoAuthGuard(): ClassDecorator & MethodDecorator {
  return SetMetadata(IS_PUBLIC_KEY, true);
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (isPublic) {
      request.session = {
        user: undefined,
        request,
        response,
      };

      return true;
    }

    const token = this.authService.getRequestToken(request);
    if (!token) {
      throw ServerError.INVALID_TOKEN;
    }

    const jwtInfo = CryptUtil.jwtVerify(token, ServerConfig.jwt.key) as JwtPayload | undefined;
    if (!jwtInfo) {
      throw ServerError.INVALID_TOKEN;
    }

    const user: SessionUser = {
      useridx: jwtInfo['useridx'],
      role: jwtInfo['role'],
      nickname: jwtInfo['nickname'],
    };

    request.session = {
      user,
      request,
      response,
    };

    return true;
  }
}
