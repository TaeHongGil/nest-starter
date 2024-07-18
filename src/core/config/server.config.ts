import * as fs from 'fs';
import * as path from 'path';

export class ServerConfig {
  serverType: string;
  port: number;
  dev: boolean;
  session: SessionConfig;
  jwt: JwtConfig;
  db: DBConfig;
  swagger: SwaggerConfig;
  constructor() {
    this.serverType = process.env.server_type;
    this.port = 8080;
    this.dev = false;
    this.db = new DBConfig();
    this.session = new SessionConfig();
    this.jwt = new JwtConfig();
    this.swagger = new SwaggerConfig();
    this._load();
  }

  private _load(): void {
    const dir = path.join(__dirname, '../../env/', `${this.serverType}-config.json`);
    const text = fs.readFileSync(dir, 'utf8');
    const config = JSON.parse(text);
    for (const key in this) {
      if (key == 'serverType') {
        continue;
      }
      this[key] = config[key];
    }
  }
}

export class SwaggerConfig {
  active: boolean;
}

export class SessionConfig {
  active: boolean;
  key: string;
  secure: boolean;
  redis: RedisConfig;
  ttl: number;
}

export class JwtConfig {
  active: boolean;
  key: string;
  ttl_access: number;
  ttl_refresh: number;
}

export class DBConfig {
  mongo: MongoConfig[];
  redis: RedisConfig[];
  mysql: MysqlConfig[];
}
export class MongoConfig {
  active: boolean;
  host: string;
  auth_source: string;
  db_name: string;
  port: number;
  user_name: string;
  password: string;
  min_pool_size: number;
  max_pool_size: number;
  use_tls: false;
}
export class RedisConfig {
  active: boolean;
  host: string;
  port: number;
  db_name: string;
  user_name: string;
  password: string;
  tls: boolean;
  db: number;
}
export class MysqlConfig {
  active: boolean;
  host: string;
  db_name: string;
  port: number;
  user_name: string;
  password: string;
  poolSize: number;
}
const serverConfig = new ServerConfig();
export default serverConfig;
