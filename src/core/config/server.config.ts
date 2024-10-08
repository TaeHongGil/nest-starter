import * as fs from 'fs';
import * as path from 'path';

export class ServerConfig {
  static serverType: string;
  static port: number = 8080;
  static dev: boolean = true;
  static session: SessionConfig = {
    active: false,
    key: '',
    secure: false,
    clustering: false,
    ttl: 0,
  };

  static jwt: JwtConfig = {
    active: false,
    key: '',
    ttl_access: 0,
    ttl_refresh: 0,
  };

  static db: DBConfig = {
    mongo: [],
    redis: [],
    mysql: [],
  };

  static swagger: SwaggerConfig = {
    active: false,
    servers: [],
  };

  static account: AccountConfig = {
    verification: {
      active: false,
      url_host: '',
      expire_sec: 0,
    },
  };

  static stmp: StmpConfig = {
    name: '',
    email: '',
    app_password: '',
  };

  static async init(): Promise<void> {
    this.serverType = process.env.server_type;
    await this._load();
  }

  static async _load(): Promise<void> {
    const dir = path.join(__dirname, '../../env/', `${this.serverType}-config.json`);
    const text = fs.readFileSync(dir, 'utf8');
    const config = JSON.parse(text);

    Object.keys(this).forEach((key) => {
      if (key === 'name' || key === 'prototype' || key === 'length' || key === 'serverType') {
        return;
      }

      if (key in config) {
        this[key] = config[key];
      } else {
        throw new Error(`Config Error: Missing key '${key}' in config file.`);
      }
    });
  }
}

export interface SwaggerConfig {
  active: boolean;
  servers: string[];
}

export interface SessionConfig {
  active: boolean;
  key: string;
  secure: boolean;
  clustering: boolean;
  ttl: number;
}

export interface JwtConfig {
  active: boolean;
  key: string;
  ttl_access: number;
  ttl_refresh: number;
}

export interface DBConfig {
  mongo: MongoConfig[];
  redis: RedisConfig[];
  mysql: MysqlConfig[];
}

export interface MongoConfig {
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

export interface RedisConfig {
  active: boolean;
  host: string;
  port: number;
  db_name: string;
  user_name: string;
  password: string;
  tls: boolean;
  db: number;
}

export interface MysqlConfig {
  active: boolean;
  host: string;
  db_name: string;
  port: number;
  user_name: string;
  password: string;
  poolSize: number;
}

export interface AccountConfig {
  verification: AccountVerificationConfig;
}

export interface AccountVerificationConfig {
  active: boolean;
  url_host: string;
  expire_sec: number;
}

export interface StmpConfig {
  name: string;
  email: string;
  app_password: string;
}

export default ServerConfig;
