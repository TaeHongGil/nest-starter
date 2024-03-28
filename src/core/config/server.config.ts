import * as fs from 'fs';
import * as path from 'path';
import { ServerLogger } from '../server-log/server.log.service';

export class ServerConfig {
  serverType: string;
  dev: boolean;
  db = {
    mongo: {},
    redis: {},
    mysql: {},
  };
  constructor() {
    this.serverType = process.env.server_type;
    this.dev = false;
    this._load();
  }

  private _load() {
    const dir = path.join(__dirname, '../../env/', `${this.serverType}-config.json`);
    const text = fs.readFileSync(dir, 'utf8');
    const config = JSON.parse(text);
    for (const key in this) {
      if (key == 'serverType') {
        continue;
      }
      if (!config[key]) {
        ServerLogger.error(`Configuration missing for key: ${key}`);
        process.exit(1);
      }
      this[key] = config[key];
    }
  }
}

const serverConfig = new ServerConfig();
export default serverConfig;
