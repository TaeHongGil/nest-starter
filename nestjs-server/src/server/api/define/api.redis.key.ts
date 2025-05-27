import { CoreRedisKeys } from '@root/core/define/core.redis.key';

export class ApiRedisKeys {
  static getUserStateKey(): string {
    return `${CoreRedisKeys.getPrefix()}:user:state`;
  }
}
