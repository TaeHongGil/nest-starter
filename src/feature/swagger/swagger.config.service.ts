import { Injectable } from '@nestjs/common';

import { AppModule } from '@root/app.module';
import ServerConfig from '@root/core/config/server.config';
import { CoreDefine } from '@root/core/define/define';
import { ServerModule } from '@root/server/server.module';
import { SwaggerOptions } from './swagger.define';

@Injectable()
export class SwaggerConfigService {
  options: SwaggerOptions;
  servers = {
    local: '',
    dev: '',
    qa: '',
    review: '',
    live: '',
  };

  init(): void {
    this.options = {
      includeModules: [AppModule, ServerModule],
      config: {
        token: { api: ['/account/login', '/account/platform/login'], body: 'data.jwt.access_token' },
        header: {},
      },
    };

    const address = ServerConfig.swagger.servers;
    if (address) {
      for (const zone of Object.keys(this.servers)) {
        this.servers[zone] = address[zone] || '';
      }
    }
    if (ServerConfig.serverType == CoreDefine.SERVER_TYPE.LOCAL) {
      this.servers.local = `http://localhost:${ServerConfig.port}`;
    }

    return;
  }
}
