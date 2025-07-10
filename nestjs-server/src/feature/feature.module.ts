import { Module } from '@nestjs/common';
import { ZONE_TYPE } from '@root/core/define/define';
import { CustomSwaggerModule } from './swagger/swagger.module';

const importModules = [];

/**
 * Live제외 모듈
 */
if (process.env.server_type !== ZONE_TYPE.LIVE) {
  importModules.push(...[CustomSwaggerModule]);
}

@Module({
  imports: [...importModules],
})
export class FeatureModule {}
