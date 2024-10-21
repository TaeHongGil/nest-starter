import ServerConfig from '../config/server.config';
import { CoreDefine } from './define';

export class ConnectKeys {
  static getPrefix(): string {
    return `${CoreDefine.SERVICE_NAME}_${ServerConfig.serverType}`;
  }

  static getGlobalKey(): string {
    return `${this.getPrefix()}_global`;
  }

  static getKey(key: string): string {
    return `${this.getPrefix()}_${key}`;
  }
}
