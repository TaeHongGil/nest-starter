import { CanActivate, ExecutionContext, Injectable, mixin, Type } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import ServerConfig from '../config/server.config';
import { ServerError } from '../error/server.error';
import CryptUtil from '../utils/crypt.utils';
import { SessionUser } from './auth.schema';
import { AuthService } from './auth.service';

/**
 *
 * @param verification 이메일 인증 여부 확인
 * @returns
 */
export const AuthGuard = (verification: boolean = true): Type<CanActivate> => {
  @Injectable()
  class AuthGuardMixin implements CanActivate {
    constructor(private readonly authService: AuthService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (!ServerConfig.account.verification.active) {
        verification = false;
      }

      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      if (ServerConfig.session.active) {
        const sessionId = request.session.id;
        if (!sessionId) {
          throw ServerError.SESSION_NOT_FOUND;
        }

        const session = await this.authService.getSessionAsync(sessionId);
        if (!session?.user) {
          throw ServerError.SESSION_NOT_FOUND;
        } else if (verification && session?.user?.verification == false) {
          throw ServerError.EMAIL_VERIFICATION_ERROR;
        }
      } else if (ServerConfig.jwt.active) {
        const jwtInfo = CryptUtil.jwtVerify(this.authService.getAuthToken(request), ServerConfig.jwt.key) as JwtPayload;
        const user: SessionUser = {
          useridx: jwtInfo['useridx'],
          verification: jwtInfo['verification'],
        };
        if (verification && !user.verification) {
          throw ServerError.EMAIL_VERIFICATION_ERROR;
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

  return mixin(AuthGuardMixin);
};

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (ServerConfig.jwt.active) {
      request.session = {
        cookie: undefined,
        user: undefined,
        request: request,
        response: response,
      };
    }

    return true;
  }
}
