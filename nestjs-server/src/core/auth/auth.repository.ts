import { Injectable } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import ServerConfig from '../config/server.config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly redis: RedisService) {}

  async setRefreshTokenAsync(useridx: number, token: string): Promise<boolean> {
    const con = this.redis.getGlobalClient();
    await con.hSet(CoreRedisKeys.getSessionKey(), useridx.toString(), token);
    const result = await con.hExpire(CoreRedisKeys.getSessionKey(), useridx.toString(), ServerConfig.jwt.ttl_refresh_sec);

    return result[0] == 1;
  }

  async getRefreshTokenAsync(useridx: number): Promise<string> {
    const con = this.redis.getGlobalClient();
    const token = await con.hGet(CoreRedisKeys.getSessionKey(), useridx.toString());

    return token;
  }

  async deleteRefreshTokenAsync(useridx: number): Promise<boolean> {
    const con = this.redis.getGlobalClient();
    await con.hDel(CoreRedisKeys.getSessionKey(), useridx.toString());

    return true;
  }
}
