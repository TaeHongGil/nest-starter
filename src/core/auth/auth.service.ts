/**
 * Redis Service
 */

import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SessionData } from 'express-session';
import serverConfig from '../config/server.config';
import { jwtSignWithExpireSec } from '../utils/crypt.utils';
import { AuthRepository } from './auth.repository';
import { NestToken, SessionUser } from './auth.schema';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async getSessionAsync(id: string): Promise<SessionData> {
    return await this.authRepository.getSessionAsync(id);
  }

  async getTokenAsync(useridx: number): Promise<NestToken> {
    return await this.authRepository.getTokenAsync(useridx);
  }

  async setTokenAsync(user: SessionUser): Promise<NestToken> {
    const token: NestToken = {
      accessToken: jwtSignWithExpireSec(user, serverConfig.jwt.key, serverConfig.jwt.ttl_access),
      refreshToken: jwtSignWithExpireSec(user, serverConfig.jwt.key, serverConfig.jwt.ttl_refresh),
    };
    await this.authRepository.setTokenAsync(user.useridx, token);
    return token;
  }

  async refreshTokenVerifyAsync(useridx: number, token: string): Promise<boolean> {
    const dbToken = await this.getTokenAsync(useridx);
    if (token != dbToken.refreshToken) {
      throw Error('not found token');
    }
    return true;
  }

  getAuthToken(req: Request): string {
    const headerToken: string = req.get('Authorization');
    if (!headerToken) {
      return undefined;
    }
    if (headerToken.startsWith('Bearer ')) {
      return headerToken.substring(7, headerToken.length);
    } else {
      return undefined;
    }
  }
}
