import { Injectable } from '@nestjs/common';

import ServerConfig from '@root/core/config/server.config';
import { SERVER_TYPE } from '@root/core/define/define';

/**
 * Swagger 옵션
 */
export interface SwaggerOptions {
  /**
   * version: api 버전
   * token: 인증토큰 받아올 api 및 body주소
   * header: 추가할 기본 헤더 (Authorization 제외)
   */
  config?: {
    version?: string;
    token?: Record<string, string>;
    header?: Record<string, any>;
  };
}

@Injectable()
class SwaggerConfig {
  static options: SwaggerOptions;
  static servers: Record<string, string>;

  static init(): void {
    const version = `v${ServerConfig.version}`;
    this.options = {
      config: {
        version: version,
        token: {
          [`/${version}/account/guest/login`]: 'data.jwt.access_token',
          [`/${version}/account/platform/login`]: 'data.jwt.access_token',
          [`/${version}/auth/token`]: 'data.jwt.access_token',
        },
        header: {
          Authorization: `Bearer `,
        },
      },
    };
    this.servers = ServerConfig.swagger.servers;
    if (ServerConfig.serverType == SERVER_TYPE.LOCAL) {
      this.servers.local = `http://localhost:${ServerConfig.port}`;
    }
  }
}

export default SwaggerConfig;
