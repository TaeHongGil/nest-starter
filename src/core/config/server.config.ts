import * as fs from 'fs';
import * as path from 'path';

export class ServerConfig {
  static serverType: string = 'local';
  static port: number = 80;
  static dev: boolean = true;
  static service: ServiceConfig = {
    name: '',
  };

  static session: SessionConfig = {
    active: false,
    secret_key: '',
    secure: false,
    redis_clustering: false,
    ttl_msec: 0,
  };

  static jwt: JwtConfig = {
    active: false,
    key: '',
    ttl_access_msec: 0,
    ttl_refresh_msec: 0,
    type: '',
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
      expires_msec: 0,
      retry_msec: 0,
    },
  };

  static stmp: StmpConfig = {
    email: '',
    app_password: '',
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
  servers: string[];
}

/**
 * 세션 설정
 */
export interface SessionConfig {
  active: boolean;
  secret_key: string;
  secure: boolean;
  redis_clustering: boolean;
  ttl_msec: number;
}

/**
 * JWT 설정
 */
export interface JwtConfig {
  active: boolean;
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
  mysql: MysqlConfig[];
}

/**
 * 몽고DB 설정
 */
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
 * Mysql 설정
 */
export interface MysqlConfig {
  active: boolean;
  host: string;
  db_name: string;
  port: number;
  user_name: string;
  password: string;
  poolSize: number;
}

/**
 * 계정 설정
 */
export interface AccountConfig {
  verification: {
    active: boolean;
    url_host: string;
    expires_msec: number;
    retry_msec: number;
  };
}

/**
 * 이메일(stmp) 설정
 */
export interface StmpConfig {
  email: string;
  app_password: string;
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
