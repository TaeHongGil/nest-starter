import ServerConfig from '@root/core/config/server.config';
import StringUtil from '../utils/string.utils';

export class CoreRedisKeys {
  static getPrefix(): string {
    return `${StringUtil.toSnakeCase(ServerConfig.service.name)}:${ServerConfig.serverType}`;
  }

  static getSessionPrefix(): string {
    return `${CoreRedisKeys.getPrefix()}:user:session`;
  }

  static getSessionKey(sessionId: string): string {
    return `${this.getSessionPrefix()}:${sessionId}`;
  }

  static getTokenDefaultKey(): string {
    return `${CoreRedisKeys.getPrefix()}:user:token:`;
  }

  static getTokenKey(useridx: number): string {
    return `${this.getSessionPrefix()}:${useridx}`;
  }

  static getGlobalNumberKey(): string {
    return `${CoreRedisKeys.getPrefix()}:global:number`;
  }

  static getGlobalCacheKey(key: string): string {
    return `${CoreRedisKeys.getPrefix()}:cache:${key}`;
  }
}
