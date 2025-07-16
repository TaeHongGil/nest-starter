import { CoreRedisKeys } from '@root/core/define/core.redis.key';

export class BatchRedisKeys {
  static getSheetKey(id: string): string {
    return `${CoreRedisKeys.getPrefix()}:sheet:${id}`;
  }
}
