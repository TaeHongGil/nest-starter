import { Controller, Get, Render } from '@nestjs/common';

import { SkipResponseInterceptor } from '@root/core/interceptor/response.interceptor';
import SwaggerConfig from './swagger.config';
import { SwaggerService } from './swagger.service';

@Controller('swagger')
@SkipResponseInterceptor()
export class SwaggerController {
  constructor(readonly swaggerService: SwaggerService) {}

  @Get('/')
  @Render('./swagger/swagger.main.ejs')
  mainRender(): any {
    return { spec: this.swaggerService.getDocument(), config: SwaggerConfig.options.config, servers: SwaggerConfig.servers };
  }

  @Get('/doc')
  @Render('./swagger/contents/doc/swagger.doc.ejs')
  docRender(): any {
    return;
  }

  @Get('/history')
  @Render('./swagger/contents/swagger.history.ejs')
  historyRender(): any {
    return;
  }
}
