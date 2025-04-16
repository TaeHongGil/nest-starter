import { CoreRedisKeys } from '@root/core/define/core.redis.key';

export class CommonRedisKeys {
  static getUserStateKey(useridx: number): string {
    return `${CoreRedisKeys.getPrefix()}:user:state:${useridx}`;
  }
}
