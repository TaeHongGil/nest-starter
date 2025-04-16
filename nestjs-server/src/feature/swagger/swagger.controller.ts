import { Controller, Get } from '@nestjs/common';

import { ApiExcludeController } from '@nestjs/swagger';
import { SkipResponseInterceptor } from '@root/core/interceptor/response.interceptor';
import SwaggerConfig from './swagger.config';
import { SwaggerService } from './swagger.service';

@Controller('swagger')
@ApiExcludeController()
@SkipResponseInterceptor()
export class SwaggerController {
  constructor(readonly swaggerService: SwaggerService) {}

  @Get('/')
  getMetadata(): any {
    return { spec: this.swaggerService.getDocument(), config: SwaggerConfig.options.config, servers: SwaggerConfig.servers };
  }
}
