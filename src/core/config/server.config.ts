import * as fs from 'fs';
import * as path from 'path';

export class ServerConfig {
  static serverType: string;
  static port: number = 8080;
  static dev: boolean = true;
  static session: SessionConfig = {
    active: false,
    secret_key: '',
    secure: false,
    redis_clustering: false,
    ttl: 0,
  };

  static jwt: JwtConfig = {
    active: false,
    key: '',
    ttl_access: 0,
    ttl_refresh: 0,
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
      expire_sec: 0,
    },
  };

  static stmp: StmpConfig = {
    name: '',
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

export interface SwaggerConfig {
  active: boolean;
  servers: string[];
}

export interface SessionConfig {
  active: boolean;
  secret_key: string;
  secure: boolean;
  redis_clustering: boolean;
  ttl: number;
}

export interface JwtConfig {
  active: boolean;
  key: string;
  type: string;
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
  verification: {
    active: boolean;
    url_host: string;
    expire_sec: number;
  };
}

export interface StmpConfig {
  name: string;
  email: string;
  app_password: string;
}

export interface PathConfig {
  root: string;
  env: string;
  ui: {
    public: string;
    view: string;
  };
}

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
