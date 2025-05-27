import * as fs from 'fs';
import * as path from 'path';

export class ServerConfig {
  version: string = '';
  serverType: string = '';
  mode: string = '';
  throttler: ThorttlerConfig[] = [];
  dev: boolean = true;
  service: ServiceConfig = { name: '' };
  jwt: JwtConfig = { key: '', ttl_access_sec: 0, ttl_refresh_sec: 0, type: '' };
  server_info: ServerInfo = { api: { port: 20000, mq: false }, socket: { port: 30000, mq: false }, mq: { port: 40000 } };
  swagger: SwaggerConfig = { active: false, servers: {} };
  paths: PathConfig = { root: '', env: '', ui: { public: '', view: '' } };
  platform: PlatformConfig = { google: { client_id: '' }, kakao: { client_id: '' }, naver: { client_id: '' } };
  db: DBConfig = {
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

  private static _instance: ServerConfig;

  static get instance(): ServerConfig {
    if (!this._instance) {
      this._instance = new ServerConfig();
    }

    return this._instance;
  }

  private constructor() {
    this.serverType = process.env.server_type;
    this.mode = process.env.mode;
    this.paths.root = path.join(__dirname, '..', '..', '..', 'src');
    this.paths.env = path.join(this.paths.root, 'env');
    this.paths.ui.public = path.join(this.paths.root, 'ui', 'public');
    this.paths.ui.view = path.join(this.paths.root, 'ui', 'view');
    this._load();
  }

  static get version(): string {
    return this.instance.version;
  }

  static get serverType(): string {
    return this.instance.serverType;
  }

  static get mode(): string {
    return this.instance.mode;
  }

  static get throttler(): ThorttlerConfig[] {
    return this.instance.throttler;
  }

  static get server_info(): ServerInfo {
    return this.instance.server_info;
  }

  static get dev(): boolean {
    return this.instance.dev;
  }

  static get service(): ServiceConfig {
    return this.instance.service;
  }

  static get jwt(): JwtConfig {
    return this.instance.jwt;
  }

  static get db(): DBConfig {
    return this.instance.db;
  }

  static get swagger(): SwaggerConfig {
    return this.instance.swagger;
  }

  static get paths(): PathConfig {
    return this.instance.paths;
  }

  static get platform(): PlatformConfig {
    return this.instance.platform;
  }

  _load(): void {
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
export interface ServerInfo {
  api: {
    port: number;
    mq: boolean;
  };
  socket: {
    port: number;
    mq: boolean;
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
