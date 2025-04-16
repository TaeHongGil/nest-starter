import { Injectable } from '@nestjs/common';

import ServerConfig from '@root/core/config/server.config';
import { SERVER_TYPE } from '@root/core/define/define';

@Injectable()
class SwaggerConfig {
  static options: SwaggerOptions;
  static servers: SwaggerServerUrls = {
    local: '',
    dev: '',
    qa: '',
    live: '',
  };

  static init(): void {
    this.options = {
      config: {
        version: `v${ServerConfig.version}`,
        token: {
          [`v${ServerConfig.version}/account/guest/login`]: 'data.jwt.access_token',
          [`v${ServerConfig.version}/account/platform/login`]: 'data.jwt.access_token',
        },
        header: {},
      },
    };
    const address = ServerConfig.swagger.servers;
    if (address) {
      for (const server_type of Object.keys(this.servers)) {
        this.servers[server_type] = address[server_type] || '';
      }
    }
    if (ServerConfig.serverType == SERVER_TYPE.LOCAL) {
      this.servers.local = `http://localhost:${ServerConfig.port}`;
    }
  }
}

/**
 * Swagger 옵션
 */
export interface SwaggerOptions {
  /**
   * token: 인증토큰 받아올 api 및 body주소
   * header: 추가할 기본 헤더 (Authorization 제외)
   */
  config?: {
    version?: string;
    token?: Record<string, string>;
    header?: Record<string, any>;
  };
}

/**
 * Swagger 적용 Url 옵션
 */
export interface SwaggerServerUrls {
  local: string;
  dev: string;
  qa: string;
  live: string;
}

export default SwaggerConfig;
