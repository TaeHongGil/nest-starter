import serverConfig from '@root/core/config/server.config';
import { CoreDefine } from '@root/core/define/define';

export class RedisKeys {
  static getPrefix(): string {
    return CoreDefine.SERVER_NAME + `:${serverConfig.serverType}`;
  }

  static getUserStateKey(): string {
    return RedisKeys.getPrefix() + ':user:state';
  }
}
