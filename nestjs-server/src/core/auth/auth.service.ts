import { Injectable } from '@nestjs/common';
import { JwtInfo } from '@root/server/common/dto/common.response.dto';
import { Request } from 'express';
import ServerConfig from '../config/server.config';
import ServerError from '../error/server.error';
import CryptUtil from '../utils/crypt.utils';
import { AuthRepository } from './auth.repository';
import { SessionUser } from './auth.schema';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async getRefreshTokenAsync(useridx: number): Promise<string> {
    return await this.authRepository.getRefreshTokenAsync(useridx);
  }

  async deleteRefreshTokenAsync(useridx: number): Promise<boolean> {
    return await this.authRepository.deleteRefreshTokenAsync(useridx);
  }

  async createAccessTokenAsync(user: SessionUser): Promise<string> {
    return CryptUtil.jwtEncode(user, ServerConfig.jwt.key, ServerConfig.jwt.ttl_access_sec);
  }

  async createRefreshTokenAsync(user: SessionUser): Promise<string> {
    const token = CryptUtil.jwtEncode(user, ServerConfig.jwt.key, ServerConfig.jwt.ttl_refresh_sec);
    await this.authRepository.setRefreshTokenAsync(user.useridx, token);

    return token;
  }

  async refreshTokenVerifyAsync(useridx: number, token: string): Promise<boolean> {
    const dbToken = await this.getRefreshTokenAsync(useridx);
    if (token != dbToken) {
      throw ServerError.INVALID_TOKEN;
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
      token_type: ServerConfig.jwt.type,
      access_token: await this.createAccessTokenAsync(user),
      access_expire_sec: ServerConfig.jwt.ttl_access_sec,
      refresh_token: await this.createRefreshTokenAsync(user),
      refresh_expire_sec: ServerConfig.jwt.ttl_refresh_sec,
    };
  }
}
