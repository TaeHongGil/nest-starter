import { Controller, Get } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';
import { AppService } from './app.service';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 하트비트
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
}
