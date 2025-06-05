import { Module } from '@nestjs/common';

import { DiscoveryModule } from '@nestjs/core';
import { SwaggerController } from './swagger.controller';
import { SwaggerService } from './swagger.service';
import { SwaggerUtil } from './swagger.utils';

@Module({
  imports: [DiscoveryModule],
  providers: [SwaggerService, SwaggerUtil],
  exports: [SwaggerService],
  controllers: [SwaggerController],
})
export class CustomSwaggerModule {}
