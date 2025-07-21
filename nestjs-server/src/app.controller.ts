import { CacheInterceptor } from '@nestjs/cache-manager';
import { All, Controller, Get, HttpCode, UseInterceptors } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import ServerConfig from '@root/core/config/server.config';
import { GoogleSheetService } from '@root/core/google/google.sheet.service';
import { NoAuthGuard, SkipResponseInterceptor } from './core/decorator/common.decorator';

@Controller('')
@SkipResponseInterceptor()
@NoAuthGuard()
export class AppController {
  constructor(private readonly googleSheetService: GoogleSheetService) {}

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
      platform: {
        google: {
          client_id: ServerConfig.platform.google.client_id,
          client_email: this.googleSheetService.getGoogleAccount().client_email,
        },
      },
    };
  }

  @All('/favicon.ico')
  @HttpCode(204)
  @UseInterceptors(CacheInterceptor)
  @ApiExcludeEndpoint()
  favicon(): any {
    return {};
  }
}
