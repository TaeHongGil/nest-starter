import { Controller, Get, UseGuards } from '@nestjs/common';

import { ApiExcludeController } from '@nestjs/swagger';
import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import ServerConfig from '@root/core/config/server.config';
import { NoAuthGuard, SkipResponseInterceptor } from '@root/core/decorator/core.decorator';
import { DevGuard } from '@root/core/guard/dev.guard';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

@Controller('swagger')
@ApiExcludeController()
@UseGuards(DevGuard)
@SkipResponseInterceptor()
@NoAuthGuard()
export class SwaggerController {
  constructor() {}

  @Get('/')
  getMetadata(): any {
    const config = new SwaggerConfig();
    const spec = { ...this.loadMetadata('api-metadata.json'), sockets: this.loadMetadata('socket-metadata.json') };

    return { spec: spec, config: config.options.config, servers: ServerConfig.swagger.servers };
  }

  loadMetadata(file: string): Record<string, Record<string, OperationObject>> {
    const filePath = path.join(ServerConfig.paths.root, 'swagger', file);
    if (!existsSync(filePath)) {
      return undefined;
    }
    const data = readFileSync(filePath, 'utf-8');

    return JSON.parse(data);
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
    token?: Record<string, string>;
    header?: Record<string, any>;
  };
}

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
