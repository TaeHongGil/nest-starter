import { Module, OnModuleInit } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import ServerConfig from '@root/core/config/server.config';
import { CoreModule } from '@root/core/core.module';
import ServerLogger from '@root/core/server-logger/server.logger';
import fs from 'fs';
import path from 'path';
import { ApiServiceModule } from './service/api.service.module';

const staticClients = ServerConfig.client
  .map((client) => ({
    ...client,
    rootPath: path.join(__dirname, '..', '..', '..', ...client.rootPath.split('/')),
  }))
  .filter((client) => fs.existsSync(client.rootPath));

const imports = [...(staticClients.length > 0 ? [ServeStaticModule.forRoot(...staticClients)] : []), ApiServiceModule];

@Module({
  imports: [...imports, CoreModule.registerDynamic(ApiModule, path.join(__dirname, 'controller'), '.controller', 'controllers')],
  providers: [],
  exports: [],
  controllers: [],
})
export class ApiModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`ApiModule.OnModuleInit`);
  }
}
