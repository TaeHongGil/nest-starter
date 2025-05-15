import { Module } from '@nestjs/common';
import { SERVER_TYPE } from '@root/core/define/define';
import { CustomSwaggerModule } from './swagger/swagger.module';

const importModules = [];

/**
 * Live제외 모듈
 */
if (process.env.server_type !== SERVER_TYPE.LIVE) {
  importModules.push(...[CustomSwaggerModule]);
}

@Module({
  imports: [...importModules],
})
export class FeatureModule {}
