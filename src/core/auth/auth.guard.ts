import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import ServerConfig from '../config/server.config';
import { ServerLogger } from '../server-log/server.log.service';
import { jwtVerify } from '../utils/crypt.utils';
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
        ServerLogger.error('Session ID is missing');
        throw new UnauthorizedException('Session ID is missing');
      }

      const session = await this.authService.getSessionAsync(sessionId);
      if (!session) {
        ServerLogger.warn(`Session not found for ID: ${sessionId}`);
        throw new UnauthorizedException('Session not found');
      }
      if (!session.user) {
        ServerLogger.warn(`Login session exists but no user data for ID: ${sessionId}`);
        throw new UnauthorizedException('Login error');
      }
    } else if (ServerConfig.jwt.active) {
      const jwtInfo = jwtVerify(this.authService.getAuthToken(request), ServerConfig.jwt.key) as JwtPayload;
      const user: SessionUser = {
        useridx: jwtInfo['useridx'],
        nickname: jwtInfo['nickname'],
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
