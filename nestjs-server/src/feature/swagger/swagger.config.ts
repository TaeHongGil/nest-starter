import { Injectable } from '@nestjs/common';

import ServerConfig from '@root/core/config/server.config';
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
  options: SwaggerOptions;

  constructor() {
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
  }
}

export default SwaggerConfig;
