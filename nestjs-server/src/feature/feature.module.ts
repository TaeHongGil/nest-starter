import { Module } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';
import { SERVER_TYPE } from '@root/core/define/define';
import { CustomSwaggerModule } from './swagger/swagger.module';

const importModules = [];

/**
 * Live제외 모듈
 */
if (ServerConfig.serverType !== SERVER_TYPE.LIVE) {
  importModules.push(...[CustomSwaggerModule]);
}

@Module({
  imports: [...importModules],
})
export class FeatureModule {}
