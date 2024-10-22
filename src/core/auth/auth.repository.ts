import { Injectable } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { SessionData } from 'express-session';
import ServerConfig from '../config/server.config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly redis: RedisService) {}

  async getSessionAsync(id: string): Promise<SessionData> {
    const con = this.redis.getGlobalClient();
    const session = await con.get(CoreRedisKeys.getSessionKey(id));

    return JSON.parse(session);
  }

  async setRefreshTokenAsync(useridx: number, token: string): Promise<boolean> {
    const con = this.redis.getGlobalClient();
    await con.pSetEx(CoreRedisKeys.getTokenKey(useridx), ServerConfig.jwt.ttl_refresh, token);

    return true;
  }

  async getRefreshTokenAsync(useridx: number): Promise<string> {
    const con = this.redis.getGlobalClient();
    const token = await con.get(CoreRedisKeys.getTokenKey(useridx));

    return token;
  }
}
