import { Module } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';
import { CoreDefine } from '@root/core/define/define';
import { CustomSwaggerModule } from './swagger/swagger.module';

const importModules = [];
/**
 * Live제외 모듈
 */
if (ServerConfig.serverType !== CoreDefine.SERVER_TYPE.LIVE) {
  importModules.push(...[CustomSwaggerModule]);
}

@Module({
  imports: [...importModules],
})
export class FeatureModule {}
