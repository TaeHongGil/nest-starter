import { Injectable } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { SessionData } from 'express-session';
import { RedisService } from '../redis/redis.service';
import { NestToken } from './auth.schema';

@Injectable()
export class AuthRepository {
  constructor(private readonly redis: RedisService) {}

  async getSessionAsync(id: string): Promise<SessionData> {
    const con = this.redis.getGlobalClient();
    const session = await con.get(CoreRedisKeys.getSessionKey(id));
    return JSON.parse(session);
  }

  async setTokenAsync(useridx: number, token: NestToken): Promise<boolean> {
    const con = this.redis.getGlobalClient();
    await con.set(CoreRedisKeys.getTokenKey(useridx), JSON.stringify(token));
    return true;
  }

  async getTokenAsync(useridx: number): Promise<NestToken> {
    const con = this.redis.getGlobalClient();
    const token = await con.get(CoreRedisKeys.getTokenKey(useridx));
    return JSON.parse(token);
  }
}
