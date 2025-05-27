import { Module, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '@root/core/server-log/server.logger';
import { AccountModule } from './account/account.module';
import { UserModule } from './user/user.module';

const importModules = [AccountModule, UserModule];

@Module({
  imports: [...importModules],
  providers: [],
  exports: [...importModules],
})
export class ApiServiceModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`ApiServiceModule.OnModuleInit`);
  }
}
