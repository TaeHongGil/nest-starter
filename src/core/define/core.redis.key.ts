import serverConfig from '@root/core/config/server.config';
import { CoreDefine } from '@root/core/define/define';

export class CoreRedisKeys {
  static getPrefix(): string {
    return CoreDefine.SERVER_NAME + `:${serverConfig.serverType}`;
  }

  static getSessionDefaultKey(): string {
    return CoreRedisKeys.getPrefix() + ':user:session:';
  }

  static getSessionKey(id: string): string {
    return this.getSessionDefaultKey() + id;
  }
}
