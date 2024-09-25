import { Controller, Get, Render } from '@nestjs/common';

import { SwaggerConfigService } from './swagger.config.service';
import { SwaggerService } from './swagger.service';

@Controller('swagger')
export class SwaggerController {
  constructor(
    readonly swaggerConfigService: SwaggerConfigService,
    readonly swaggerService: SwaggerService,
  ) {}

  @Get('/')
  @Render('./swagger.main.ejs')
  mainRender(): any {
    return { spec: this.swaggerService.getDocument(), config: this.swaggerConfigService.options.config, servers: this.swaggerConfigService.servers };
  }

  @Get('/doc')
  @Render('./contents/doc/swagger.doc.ejs')
  docRender(): any {
    return;
  }

  @Get('/history')
  @Render('./contents/swagger.history.ejs')
  historyRender(): any {
    return;
  }
}
