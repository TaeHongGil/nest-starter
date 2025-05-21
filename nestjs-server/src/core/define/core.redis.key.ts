import { ConnectKeys } from './connect.key';

export class CoreRedisKeys {
  static getSessionKey(): string {
    return `${ConnectKeys.getPrefix()}:user:session`;
  }

  static getGlobalNumberKey(): string {
    return `${ConnectKeys.getPrefix()}:global:number`;
  }

  static getGlobalCacheKey(key: string): string {
    return `${ConnectKeys.getPrefix()}:cache:${key}`;
  }
}
