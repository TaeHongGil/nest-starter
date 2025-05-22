import * as fs from 'fs';
import * as path from 'path';

export class ServerConfig {
  static version: string = '1';
  static serverType: string = 'local';
  static mode: string = 'api';
  static throttler: ThorttlerConfig[] = [];
  static port: PortConfig = {
    api: 20000,
    socket: 30000,
    mq: 40000,
  };

  static dev: boolean = true;
  static service: ServiceConfig = {
    name: '',
  };

  static jwt: JwtConfig = {
    key: '',
    ttl_access_sec: 0,
    ttl_refresh_sec: 0,
    type: '',
  };

  static db: DBConfig = {
    mongo: {
      active: false,
      hosts: [],
      replica_set: '',
      auth_source: '',
      db_name: '',
      user_name: '',
      password: '',
      min_pool_size: 0,
      max_pool_size: 0,
      use_tls: false,
    },
    redis: {
      active: false,
      host: '',
      port: 0,
      db_name: '',
      user_name: '',
      password: '',
      tls: false,
      db: 0,
    },
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
    this.mode = process.env.mode;
    this.paths.root = path.join(__dirname, '..', '..', '..', 'src');
    this.paths.env = path.join(this.paths.root, 'env');
    this.paths.ui.public = path.join(this.paths.root, 'ui', 'public');
    this.paths.ui.view = path.join(this.paths.root, 'ui', 'view');
    await this._load();
  }

  static async _load(): Promise<void> {
    const excludes = ['name', 'prototype', 'length', 'serverType', 'paths', 'mode'];
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
        if (forceConfig && key in forceConfig) {
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
 * 포트 설정
 */
export interface PortConfig {
  api: number;
  socket: number;
  mq: number;
}

export interface ServerUrl {
  api: string;
  socket: string;
}

/**
 * 스웨거 설정
 */
export interface SwaggerConfig {
  active: boolean;
  servers: Record<string, ServerUrl>;
}

/**
 * JWT 설정
 */
export interface JwtConfig {
  key: string;
  type: string;
  ttl_access_sec: number;
  ttl_refresh_sec: number;
}

/**
 * DB설정
 */
export interface DBConfig {
  mongo: MongoConfig;
  redis: RedisConfig;
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

/**
 * 플랫폼 설정
 */
export interface ThorttlerConfig {
  name: string;
  ttl: number;
  limit: number;
}

export default ServerConfig;
