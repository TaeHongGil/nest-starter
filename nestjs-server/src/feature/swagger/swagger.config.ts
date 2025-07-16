import { Injectable } from '@nestjs/common';

/**
 * Swagger 옵션
 */
export interface SwaggerOptions {
  /**
   * token: 인증토큰 받아올 api 및 body주소
   * header: 추가할 기본 헤더 (Authorization 제외)
   */
  config?: {
    token?: Record<string, string>;
    header?: Record<string, any>;
  };
}

@Injectable()
class SwaggerConfig {
  options: SwaggerOptions;

  constructor() {
    this.options = {
      config: {
        token: {
          ['/account/guest/login']: 'data.jwt.access_token',
          ['/account/platform/login']: 'data.jwt.access_token',
          ['/auth/token']: 'data.jwt.access_token',
        },
        header: {
          Authorization: `Bearer `,
        },
      },
    };
  }
}

export default SwaggerConfig;
