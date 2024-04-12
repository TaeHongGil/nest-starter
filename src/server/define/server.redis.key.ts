import { CoreRedisKeys } from '@root/core/define/core.redis.key';

export class ServerRedisKeys {
  static getUserStateKey(): string {
    return CoreRedisKeys.getPrefix() + ':user:state';
  }
}
