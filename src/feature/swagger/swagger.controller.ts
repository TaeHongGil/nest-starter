import { Controller, Get, Render } from '@nestjs/common';

import { SkipResponseInterceptor } from '@root/core/interceptor/response.interceptor';
import { SwaggerConfigService } from './swagger.config.service';
import { SwaggerService } from './swagger.service';

@Controller('swagger')
@SkipResponseInterceptor()
export class SwaggerController {
  constructor(
    readonly swaggerConfigService: SwaggerConfigService,
    readonly swaggerService: SwaggerService,
  ) {}

  @Get('/')
  @Render('./swagger/swagger.main.ejs')
  mainRender(): any {
    return { spec: this.swaggerService.getDocument(), config: this.swaggerConfigService.options.config, servers: this.swaggerConfigService.servers };
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
