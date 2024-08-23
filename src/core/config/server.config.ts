import * as fs from 'fs';
import * as path from 'path';

export class ServerConfig {
  static serverType: string;
  static serverAdress: string[];
  static port: number;
  static dev: boolean;
  static session: SessionConfig;
  static jwt: JwtConfig;
  static db: DBConfig;
  static swagger: SwaggerConfig;

  static async init(): Promise<void> {
    ServerConfig.serverType = process.env.server_type;
    ServerConfig.port = 8080;
    ServerConfig.dev = false;
    ServerConfig.db = new DBConfig();
    ServerConfig.session = new SessionConfig();
    ServerConfig.jwt = new JwtConfig();
    ServerConfig.swagger = new SwaggerConfig();
    await ServerConfig._load();
  }

  static async _load(): Promise<void> {
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

export default ServerConfig;
