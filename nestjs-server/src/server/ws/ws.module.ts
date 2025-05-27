import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule } from '@root/core/core.module';
import ServerLogger from '@root/core/server-log/server.logger';
import path from 'path';
import { WsServiceModule } from './service/ws.service.module';

@Module({
  imports: [WsServiceModule, CoreModule.registerDynamic(WsModule, path.join(__dirname, 'gateway'), '.gateway', 'providers')],
  providers: [],
})
export class WsModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`WsModule.OnModuleInit`);
  }
}
