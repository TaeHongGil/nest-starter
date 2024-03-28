import { Controller, Get } from '@nestjs/common';
import serverConfig from '@root/core/config/server.config';
import { AppService } from './app.service';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  healthCheck() {
    return { msg: 'server alive' };
  }

  @Get('/info')
  getInfo() {
    return {
      serverType: serverConfig.serverType,
    };
  }
}
