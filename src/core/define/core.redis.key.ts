import ServerConfig from '@root/core/config/server.config';
import { CoreDefine } from '@root/core/define/define';

export class CoreRedisKeys {
  static getPrefix(): string {
    return CoreDefine.SERVER_NAME + `:${ServerConfig.serverType}`;
  }

  static getSessionDefaultKey(): string {
    return CoreRedisKeys.getPrefix() + ':user:session:';
  }

  static getSessionKey(sessionId: string): string {
    return this.getSessionDefaultKey() + sessionId;
  }

  static getTokenDefaultKey(): string {
    return CoreRedisKeys.getPrefix() + ':user:token:';
  }

  static getTokenKey(useridx: number): string {
    return this.getSessionDefaultKey() + useridx;
  }
}
