import { Module } from '@nestjs/common';

import { DiscoveryModule } from '@nestjs/core';
import { SwaggerService } from './swagger.service';
import { SwaggerUtil } from './swagger.utils';

@Module({
  imports: [DiscoveryModule],
  providers: [SwaggerService, SwaggerUtil],
  exports: [SwaggerService],
  controllers: [],
})
export class CustomSwaggerModule {}
