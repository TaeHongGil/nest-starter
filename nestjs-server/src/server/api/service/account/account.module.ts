import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import ServerLogger from '@root/core/server-logger/server.logger';
import { AccountPlatformService } from './account.platform.service';
import { AccountRepository } from './account.repository';
import { DBAccount, DBAccountSchema } from './account.schema';
import { AccountService } from './account.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: DBAccount.name, schema: DBAccountSchema }])],
  controllers: [],
  providers: [AccountRepository, AccountService, AccountPlatformService],
  exports: [AccountService, AccountPlatformService],
})
export class AccountModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`AccountModule.OnModuleInit`);
  }
}
