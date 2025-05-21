import { Controller, Get } from '@nestjs/common';

import { ApiExcludeController } from '@nestjs/swagger';
import ServerConfig from '@root/core/config/server.config';
import { NoAuthGuard } from '@root/core/guard/auth.guard';
import { SkipResponseInterceptor } from '@root/core/interceptor/response.interceptor';
import SwaggerConfig from './swagger.config';
import { SwaggerService } from './swagger.service';
import { SwaggerUtil } from './swagger.utils';

@Controller('swagger')
@ApiExcludeController()
@SkipResponseInterceptor()
@NoAuthGuard()
export class SwaggerController {
  private socketMetadataCache: any = null;

  constructor(
    readonly swaggerService: SwaggerService,
    readonly swaggerUtil: SwaggerUtil,
  ) {}

  @Get('/')
  getMetadata(): any {
    const config = new SwaggerConfig();
    const now = Date.now();
    if (!this.socketMetadataCache || ServerConfig.serverType == 'local') {
      this.socketMetadataCache = this.swaggerUtil.loadSocketMetadata();
    }
    const spec = { ...this.swaggerService.getDocument(), sockets: this.socketMetadataCache };

    return { spec: spec, config: config.options.config, servers: ServerConfig.swagger.servers };
  }
}
