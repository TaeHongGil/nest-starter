import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import serverConfig from '../config/server.config';
import { ServerLogger } from '../server-log/server.log.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (serverConfig.session.active) {
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
    }
    return true;
  }
}
