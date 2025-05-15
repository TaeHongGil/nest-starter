import { Injectable } from '@nestjs/common';

import ServerConfig from '@root/core/config/server.config';
import { SwaggerOptions } from './swagger.dto';

@Injectable()
class SwaggerConfig {
  options: SwaggerOptions;
  servers: Record<string, string>;

  constructor() {
    const version = `v${ServerConfig.version}`;
    this.options = {
      config: {
        version: version,
        token: {
          [`/${version}/account/guest/login`]: 'data.jwt.access_token',
          [`/${version}/account/platform/login`]: 'data.jwt.access_token',
          [`/${version}/auth/token`]: 'data.jwt.access_token',
        },
        header: {
          Authorization: `Bearer `,
        },
      },
    };
    this.servers = ServerConfig.swagger.servers;
  }
}

export default SwaggerConfig;
