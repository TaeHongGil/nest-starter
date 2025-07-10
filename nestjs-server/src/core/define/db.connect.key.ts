import ServerConfig from '../config/server.config';
import StringUtil from '../utils/string.utils';

export class DBConnectKeys {
  static getPrefix(): string {
    return `${StringUtil.toSnakeCase(ServerConfig.service.name)}_${ServerConfig.zone}`;
  }

  static getKey(key: string): string {
    return `${this.getPrefix()}_${key}`;
  }
}
