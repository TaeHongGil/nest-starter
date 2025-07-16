import { ServeStaticModuleOptions } from '@nestjs/serve-static';
import { SERVER_TYPE, ZONE_TYPE } from '@root/core/define/define';
import * as fs from 'fs';
import * as path from 'path';

class ServerConfig {
  static zone: string = ZONE_TYPE.LOCAL;
  static server_type: string = SERVER_TYPE.NONE;
  static throttler: ThorttlerConfig[] = [];
  static dev: boolean = true;
  static service: ServiceConfig = {
    name: '',
  };

  static client: ServeStaticModuleOptions[] = [];

  static jwt: JwtConfig = {
    key: '',
    ttl_access_sec: 0,
    ttl_refresh_sec: 0,
    type: '',
  };

  static server_info: ServerInfo = {
    api: { port: 20000 },
    socket: { port: 30000 },
    mq: { port: 40000 },
  };

  static swagger: SwaggerConfig = {
    active: false,
    servers: {},
  };

  static paths: PathConfig = {
    root: '',
    env: '',
    ui: { public: '', view: '' },
  };

  static platform: PlatformConfig = {
    google: { client_id: '' },
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

  static {
    this.loadConfig();
  }

  private static loadConfig(): void {
    this.zone = process.env.zone;
    this.server_type = process.env.server_type;

    if (this.zone === ZONE_TYPE.TEST) {
      this.server_type = SERVER_TYPE.NONE;
    }

    if (!this.zone || !this.server_type) {
      return;
    }

    this.paths.root = path.join(__dirname, '..', '..', '..', 'src');
    this.paths.env = path.join(this.paths.root, 'env');
    this.paths.ui.public = path.join(this.paths.root, 'ui', 'public');
    this.paths.ui.view = path.join(this.paths.root, 'ui', 'view');

    const excludes = ['name', 'prototype', 'length', 'zone', 'paths', 'server_type'];
    const configPath = path.join(this.paths.env, `${this.zone}-config.json`);
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
export interface ServerInfo {
  api: {
    port: number;
  };
  socket: {
    port: number;
  };
  mq: {
    port: number;
  };
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
