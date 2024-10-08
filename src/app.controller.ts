import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import ServerConfig from '@root/core/config/server.config';
import { AppService } from './app.service';

@Controller('')
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  healthCheck(): any {
    return {};
  }

  @Get('/info')
  getInfo(): any {
    return {
      serverType: ServerConfig.serverType,
    };
  }
}
