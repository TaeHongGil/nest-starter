import { Module } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';
import { CoreDefine } from '@root/core/define/define';
import { CustomSwaggerModule } from './swagger/swagger.module';
import { UITestModule } from './ui-test/ui.test.module';

const importModules = [];
/**
 * Live제외 모듈
 */
if (ServerConfig.serverType !== CoreDefine.SERVER_TYPE.LIVE) {
  importModules.push(...[CustomSwaggerModule, UITestModule]);
}

@Module({
  imports: [...importModules],
})
export class FeatureModule {}
