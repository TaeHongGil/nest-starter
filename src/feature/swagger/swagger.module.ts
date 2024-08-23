import { Module } from '@nestjs/common';

import { SwaggerConfigService } from './swagger.config.service';
import { SwaggerController } from './swagger.controller';
import { SwaggerService } from './swagger.service';
import { SwaggerUtilService } from './swagger.utils.service';

@Module({
  imports: [],
  providers: [SwaggerService, SwaggerConfigService, SwaggerUtilService],
  exports: [SwaggerService],
  controllers: [SwaggerController],
})
export class CustomSwaggerModule {}
