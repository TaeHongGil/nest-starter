import { Controller, Get, Param, Render, Res } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';
import { SkipResponseInterceptor } from '@root/core/interceptor/response.interceptor';
import { Response } from 'express';

@Controller('test')
@SkipResponseInterceptor()
export class UITestController {
  constructor() {}

  @Get('/')
  @Render('./test/test.main.ejs')
  mainRender(): any {
    return { platform: ServerConfig.platform };
  }

  @Get('/:page')
  loadPage(@Res() res: Response, @Param('page') page: string): any {
    return res.render(`./test/contents/test.${page}.ejs`);
  }
}
