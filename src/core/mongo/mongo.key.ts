import serverConfig from '../config/server.config';
import { CoreDefine } from '../define/define';

export class MongoKeys {
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

const mongo_keys = new MongoKeys();
export default mongo_keys;
