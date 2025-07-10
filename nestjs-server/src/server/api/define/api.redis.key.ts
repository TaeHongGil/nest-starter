import { CoreRedisKeys } from '@root/core/define/core.redis.key';

export class ApiRedisKeys {
  static getUserStateKey(useridx: number): string {
    return `${CoreRedisKeys.getPrefix()}:user:state:${useridx}`;
  }
}
