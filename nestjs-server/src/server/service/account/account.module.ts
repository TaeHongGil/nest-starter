import { Module, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '@root/core/server-log/server.log.service';
import { AccountPlatformService } from './account.platform.service';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AccountRepository, AccountService, AccountPlatformService],
  exports: [AccountService, AccountPlatformService],
})
export class AccountModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`AccountModule.OnModuleInit`);
  }
}
