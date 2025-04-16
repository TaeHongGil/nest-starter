import { All, Controller, Get, HttpCode, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import ServerConfig from '@root/core/config/server.config';
import { AppService } from './app.service';
import { SkipResponseInterceptor } from './core/interceptor/response.interceptor';

@Controller('')
@SkipResponseInterceptor()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
  getInfo(): any {
    return {
      platform: ServerConfig.platform,
    };
  }

  @All('/favicon.ico')
  @Version(VERSION_NEUTRAL)
  @HttpCode(204)
  @ApiExcludeEndpoint()
  favicon() {
    return {};
  }
}
