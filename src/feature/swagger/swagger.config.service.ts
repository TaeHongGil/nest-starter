import { Injectable } from '@nestjs/common';
import { join } from 'path';

import { AppModule } from '@root/app.module';
import ServerConfig from '@root/core/config/server.config';
import { CoreDefine } from '@root/core/define/define';
import { ServerModule } from '@root/server/server.module';
import { SwaggerOptions } from './swagger.define';

@Injectable()
export class SwaggerConfigService {
  options: SwaggerOptions;
  path = {
    swagger: '',
    ui: {
      public: '',
      view: '',
    },
  };

  servers = {
    local: '',
    dev: '',
    qa: '',
    review: '',
    live: '',
  };

  constructor() {
    this.options = {
      includeModules: [AppModule, ServerModule],
      config: {
        token: { api: '/account/login', body: 'accessToken' },
        header: {},
      },
    };
    this.path.swagger = __dirname;
    this.path.ui = {
      public: join(this.path.swagger, '../../../src/feature/swagger/ui', 'public'),
      view: join(this.path.swagger, '../../../src/feature/swagger/ui', 'views'),
    };

    const address = ServerConfig.serverAdress;
    if (address) {
      for (const zone of Object.keys(this.servers)) {
        this.servers[zone] = address[zone] || '';
      }
    }
    if (ServerConfig.serverType == CoreDefine.SERVER_TYPE.LOCAL) {
      this.servers.local = `http://localhost:${ServerConfig.port}`;
    }
  }
}
