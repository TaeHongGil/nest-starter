import { Injectable, Type } from '@nestjs/common';

import { AppModule } from '@root/app.module';
import ServerConfig from '@root/core/config/server.config';
import { SERVER_TYPE } from '@root/core/define/define';
import { ServerModule } from '@root/server/server.module';

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
      includeModules: [AppModule, ServerModule],
      config: {
        token: { api: ['/account/guest/login', '/account/platform/login'], body: 'data.jwt.access_token' },
        header: {},
      },
    };

    const address = ServerConfig.swagger.servers;
    if (address) {
      for (const zone of Object.keys(this.servers)) {
        this.servers[zone] = address[zone] || '';
      }
    }
    if (ServerConfig.serverType == SERVER_TYPE.LOCAL) {
      this.servers.local = `http://localhost:${ServerConfig.port}`;
    }

    return;
  }
}

/**
 * Swagger 옵션
 */
export interface SwaggerOptions {
  /**
   * API 생성할 모듈
   */
  includeModules: Type[];

  /**
   * token: 인증토큰 받아올 api 및 body주소
   * header: 추가할 기본 헤더 (Authorization 제외)
   */
  config?: {
    token?: { api: string[]; body: string };
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
