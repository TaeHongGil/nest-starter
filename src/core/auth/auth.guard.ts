import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import ServerConfig from '../config/server.config';
import { ServerError } from '../error/server.error';
import CryptUtil from '../utils/crypt.utils';
import { SessionUser } from './auth.schema';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    if (ServerConfig.session.active) {
      const sessionId = request.session.id;
      if (!sessionId) {
        throw ServerError.SESSION_NOT_FOUND;
      }

      const session = await this.authService.getSessionAsync(sessionId);
      if (!session || session.user) {
        throw ServerError.SESSION_NOT_FOUND;
      }
    } else if (ServerConfig.jwt.active) {
      const jwtInfo = CryptUtil.jwtVerify(this.authService.getAuthToken(request), ServerConfig.jwt.key) as JwtPayload;
      const user: SessionUser = {
        useridx: jwtInfo['useridx'],
      };
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
