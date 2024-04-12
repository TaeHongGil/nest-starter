import { Injectable } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { SessionData } from 'express-session';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly redis: RedisService) {}

  async getSessionAsync(id: string): Promise<SessionData> {
    const con = this.redis.getGlobalClient();
    const sessionJson = await con.get(CoreRedisKeys.getSessionKey(id));
    if (sessionJson) {
      const sessionObj = JSON.parse(sessionJson);
      const sessionData: SessionData = {
        cookie: sessionObj.cookie,
        user: sessionObj.user,
      };
      return sessionData;
    }
    return undefined;
  }
}
