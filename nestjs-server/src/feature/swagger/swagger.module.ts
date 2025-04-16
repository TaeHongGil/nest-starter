import { Module } from '@nestjs/common';

import { SwaggerController } from './swagger.controller';
import { SwaggerService } from './swagger.service';
import { SwaggerUtil } from './swagger.utils';

@Module({
  imports: [],
  providers: [SwaggerService, SwaggerUtil],
  exports: [SwaggerService],
  controllers: [SwaggerController],
})
export class CustomSwaggerModule {}
