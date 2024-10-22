/**
 * Redis Service
 */

import { Injectable } from '@nestjs/common';
import { JwtInfo } from '@root/server/common/response.dto';
import { Request } from 'express';
import { SessionData } from 'express-session';
import ServerConfig from '../config/server.config';
import CryptUtil from '../utils/crypt.utils';
import { AuthRepository } from './auth.repository';
import { SessionUser } from './auth.schema';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async getSessionAsync(id: string): Promise<SessionData> {
    return await this.authRepository.getSessionAsync(id);
  }

  async getRefreshTokenAsync(useridx: number): Promise<string> {
    return await this.authRepository.getRefreshTokenAsync(useridx);
  }

  async createAccessTokenAsync(user: SessionUser): Promise<string> {
    return CryptUtil.jwtEncode(user, ServerConfig.jwt.key, ServerConfig.jwt.ttl_access);
  }

  async createRefreshTokenAsync(user: SessionUser): Promise<string> {
    const token = CryptUtil.jwtEncode(user, ServerConfig.jwt.key, ServerConfig.jwt.ttl_refresh);
    await this.authRepository.setRefreshTokenAsync(user.useridx, token);

    return token;
  }

  async refreshTokenVerifyAsync(useridx: number, token: string): Promise<boolean> {
    const dbToken = await this.getRefreshTokenAsync(useridx);
    if (token != dbToken) {
      throw Error('not found token');
    }

    return true;
  }

  getAuthToken(req: Request): string {
    const headerToken: string = req.get('Authorization');
    if (!headerToken) {
      return undefined;
    }
    if (headerToken.startsWith(`${ServerConfig.jwt.type} `)) {
      return headerToken.substring(7, headerToken.length);
    } else {
      return undefined;
    }
  }

  async createTokenInfoAsync(user: SessionUser): Promise<JwtInfo> {
    return {
      access_token: await this.createAccessTokenAsync(user),
      token_type: ServerConfig.jwt.type,
      expires_in: ServerConfig.jwt.ttl_access,
      refresh_token: await this.createRefreshTokenAsync(user),
    };
  }
}
