import * as fs from 'fs';
import * as path from 'path';

export class ServerConfig {
  static version: string = '1';
  static serverType: string = 'local';
  static port: number = 80;
  static dev: boolean = true;
  static service: ServiceConfig = {
    name: '',
  };

  static jwt: JwtConfig = {
    key: '',
    ttl_access_msec: 0,
    ttl_refresh_msec: 0,
    type: '',
  };

  static db: DBConfig = {
    mongo: [],
    redis: [],
  };

  static swagger: SwaggerConfig = {
    active: false,
    servers: {},
  };

  static paths: PathConfig = {
    root: '',
    env: '',
    ui: {
      public: '',
      view: '',
    },
  };

  static platform: PlatformConfig = {
    google: {
      client_id: '',
    },
    kakao: {
      client_id: '',
    },
    naver: {
      client_id: '',
    },
  };

  static async init(): Promise<void> {
    global.ServerConfig = ServerConfig;
    this.serverType = process.env.server_type;
    this.paths.root = path.join(process.cwd(), 'src');
    this.paths.env = path.join(this.paths.root, 'env');
    this.paths.ui.public = path.join(this.paths.root, 'ui', 'public');
    this.paths.ui.view = path.join(this.paths.root, 'ui', 'view');
    await this._load();
  }

  static async _load(): Promise<void> {
    const excludes = ['name', 'prototype', 'length', 'serverType', 'paths'];
    const configPath = path.join(this.paths.env, `${this.serverType}-config.json`);
    const forceConfigPath = path.join(this.paths.env, `force-config.json`);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    let forceConfig = undefined;
    if (fs.existsSync(forceConfigPath)) {
      forceConfig = JSON.parse(fs.readFileSync(forceConfigPath, 'utf8'));
    }

    Object.keys(this).forEach((key) => {
      if (excludes.includes(key)) {
        return;
      }

      if (key in config) {
        if (key in forceConfig) {
          this[key] = forceConfig[key];
        } else {
          this[key] = config[key];
        }
      } else {
        throw new Error(`Config Error: Missing key '${key}' in config file.`);
      }
    });
  }
}

/**
 * 서비스 설정
 */
export interface ServiceConfig {
  name: string;
}

/**
 * 스웨거 설정
 */
export interface SwaggerConfig {
  active: boolean;
  servers: Record<string, string>;
}

/**
 * JWT 설정
 */
export interface JwtConfig {
  key: string;
  type: string;
  ttl_access_msec: number;
  ttl_refresh_msec: number;
}

/**
 * DB설정
 */
export interface DBConfig {
  mongo: MongoConfig[];
  redis: RedisConfig[];
}

/**
 * 몽고DB 설정
 */
export interface MongoConfig {
  active: boolean;
  hosts: string[];
  replica_set: string;
  auth_source: string;
  db_name: string;
  user_name: string;
  password: string;
  min_pool_size: number;
  max_pool_size: number;
  use_tls: false;
}

/**
 * Redis 설정
 */
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

/**
 * 경로 설정
 */
export interface PathConfig {
  root: string;
  env: string;
  ui: {
    public: string;
    view: string;
  };
}

/**
 * 플랫폼 설정
 */
export interface PlatformConfig {
  google: {
    client_id: string;
  };
  kakao: {
    client_id: string;
  };
  naver: {
    client_id: string;
  };
}

export default ServerConfig;
