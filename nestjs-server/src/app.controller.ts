import { CacheInterceptor } from '@nestjs/cache-manager';
import { All, Controller, Get, HttpCode, UseInterceptors, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import ServerConfig from '@root/core/config/server.config';
import { NoAuthGuard, SkipResponseInterceptor } from './core/decorator/common.decorator';

@Controller('')
@SkipResponseInterceptor()
@NoAuthGuard()
export class AppController {
  constructor() {}

  /**
   * 헬스체크
   */
  @Get('/')
  healthCheck(): any {
    return {
      message: 'Server is running',
    };
  }

  /**
   * 서버 정보
   */
  @Get('/info')
  @UseInterceptors(CacheInterceptor)
  getInfo(): any {
    return {
      platform: ServerConfig.platform,
    };
  }

  @All('/favicon.ico')
  @Version(VERSION_NEUTRAL)
  @HttpCode(204)
  @UseInterceptors(CacheInterceptor)
  @ApiExcludeEndpoint()
  favicon(): any {
    return {};
  }
}
