import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule } from '@root/core/core.module';
import { ServerLogger } from '@root/core/server-log/server.log.service';
import path from 'path';
import { AccountModule } from './service/account/account.module';

@Module({
  imports: [AccountModule, CoreModule.registerController(ServerModule, path.join(__dirname, 'controller'), '.controller')],
  controllers: [],
  providers: [],
  exports: [],
})
export class ServerModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`ServerModule.OnModuleInit`);
  }
}
