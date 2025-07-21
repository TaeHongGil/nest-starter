import { CoreRedisKeys } from '@root/core/define/core.redis.key';

export class ApiRedisKeys extends CoreRedisKeys {
  static getUserStateKey(useridx: number): string {
    return `${this.getPrefix()}:user:state:${useridx}`;
  }
}
