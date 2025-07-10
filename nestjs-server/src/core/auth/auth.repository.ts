import { Injectable } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import ServerConfig from '../config/server.config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly redis: RedisService) {}

  async setRefreshTokenAsync(useridx: number, token: string): Promise<boolean> {
    const con = this.redis.getGlobalClient();
    const key = CoreRedisKeys.getSessionKey(useridx);
    await con.set(key, token);
    await con.expire(key, ServerConfig.jwt.ttl_refresh_sec);

    return true;
  }

  async getRefreshTokenAsync(useridx: number): Promise<string> {
    const con = this.redis.getGlobalClient();
    const key = CoreRedisKeys.getSessionKey(useridx);
    const token = (await con.get(key)) as string;

    return token;
  }

  async deleteRefreshTokenAsync(useridx: number): Promise<boolean> {
    const con = this.redis.getGlobalClient();
    const key = CoreRedisKeys.getSessionKey(useridx);
    await con.del(key);

    return true;
  }
}
