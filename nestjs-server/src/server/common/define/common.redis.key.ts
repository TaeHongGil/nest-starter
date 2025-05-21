import { ConnectKeys } from '@root/core/define/connect.key';

export class CommonRedisKeys {
  static getUserStateKey(): string {
    return `${ConnectKeys.getPrefix()}:user:state`;
  }
}
