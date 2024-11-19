import { Module } from '@nestjs/common';

import { SwaggerController } from './swagger.controller';
import { SwaggerService } from './swagger.service';
import { SwaggerUtilService } from './swagger.utils.service';

@Module({
  imports: [],
  providers: [SwaggerService, SwaggerUtilService],
  exports: [SwaggerService],
  controllers: [SwaggerController],
})
export class CustomSwaggerModule {}
