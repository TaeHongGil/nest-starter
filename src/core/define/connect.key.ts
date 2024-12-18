import ServerConfig from '../config/server.config';
import StringUtil from '../utils/string.utils';

export class ConnectKeys {
  static getPrefix(): string {
    return `${StringUtil.toSnakeCase(ServerConfig.service.name)}_${ServerConfig.serverType}`;
  }

  static getGlobalKey(): string {
    return `${this.getPrefix()}_global`;
  }

  static getKey(key: string): string {
    return `${this.getPrefix()}_${key}`;
  }
}
