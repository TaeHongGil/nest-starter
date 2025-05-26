import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule } from '@root/core/core.module';
import { ServerLogger } from '@root/core/server-log/server.logger';
import path from 'path';
import { AccountModule } from './service/account/account.module';

@Module({
  imports: [AccountModule, CoreModule.registerDynamic(CommonModule, path.join(__dirname, 'controller'), '.controller', 'controllers')],
  controllers: [],
  providers: [],
  exports: [],
})
export class CommonModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`CommonModule.OnModuleInit`);
  }
}
