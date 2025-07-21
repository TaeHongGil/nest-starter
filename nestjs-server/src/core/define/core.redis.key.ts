import ServerConfig from '@root/core/config/server.config';
import StringUtil from '../utils/string.utils';

export class CoreRedisKeys {
  static getPrefix(): string {
    return `${StringUtil.toSnakeCase(ServerConfig.service.name)}:${ServerConfig.zone}`;
  }

  static getSessionKey(useridx: number): string {
    return `${this.getPrefix()}:user:session:${useridx}`;
  }

  static getTokenDefaultKey(): string {
    return `${this.getPrefix()}:user:token:`;
  }

  static getGlobalNumberKey(): string {
    return `${this.getPrefix()}:global:number`;
  }

  static getGlobalCacheKey(key: string): string {
    return `${this.getPrefix()}:cache:${key}`;
  }
}
