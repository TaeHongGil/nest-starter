import ServerConfig from '@root/core/config/server.config';
import StringUtil from '../utils/string.utils';

export class CoreRedisKeys {
  static getPrefix(): string {
    return `${StringUtil.toSnakeCase(ServerConfig.service.name)}:${ServerConfig.zone}`;
  }

  static getSessionKey(useridx: number): string {
    return `${CoreRedisKeys.getPrefix()}:user:session:${useridx}`;
  }

  static getTokenDefaultKey(): string {
    return `${CoreRedisKeys.getPrefix()}:user:token:`;
  }

  static getGlobalNumberKey(): string {
    return `${CoreRedisKeys.getPrefix()}:global:number`;
  }

  static getGlobalCacheKey(key: string): string {
    return `${CoreRedisKeys.getPrefix()}:cache:${key}`;
  }
}
