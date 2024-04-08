import serverConfig from '../config/server.config';
import { CoreDefine } from '../define/define';

export class MysqlKeys {
  getPrefix(): string {
    return CoreDefine.SERVER_NAME + `_${serverConfig.serverType}`;
  }

  getGlobalKey(): string {
    return this.getPrefix() + '_global';
  }

  getKey(key: string): string {
    return this.getPrefix() + `_${key}`;
  }
}

const mysql_keys = new MysqlKeys();
export default mysql_keys;
