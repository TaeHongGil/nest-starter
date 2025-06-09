import { Controller, Get, UseInterceptors } from '@nestjs/common';

import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiExcludeController } from '@nestjs/swagger';
import ServerConfig from '@root/core/config/server.config';
import { NoAuthGuard, SkipResponseInterceptor } from '@root/core/decorator/common.decorator';
import SwaggerConfig from './swagger.config';
import { SwaggerService } from './swagger.service';
import { SwaggerUtil } from './swagger.utils';

@Controller('swagger')
@ApiExcludeController()
@SkipResponseInterceptor()
@NoAuthGuard()
export class SwaggerController {
  constructor(
    readonly swaggerService: SwaggerService,
    readonly swaggerUtil: SwaggerUtil,
  ) {}

  @Get('/')
  @UseInterceptors(CacheInterceptor)
  getMetadata(): any {
    const config = new SwaggerConfig();
    const spec = { ...this.swaggerService.getDocument(), sockets: this.swaggerUtil.loadSocketMetadata() };

    return { spec: spec, config: config.options.config, servers: ServerConfig.swagger.servers };
  }
}
