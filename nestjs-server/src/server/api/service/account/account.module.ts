import { Module, OnModuleInit } from '@nestjs/common';

import { MongoModule } from '@root/core/mongo/mongo.module';
import ServerLogger from '@root/core/server-logger/server.logger';
import { AccountRepository } from './account.repository';
import { DBAccount, DBAccountSchema } from './account.schema';
import { AccountService } from './account.service';

@Module({
  imports: [MongoModule.forFeature([{ name: DBAccount.name, schema: DBAccountSchema }])],
  controllers: [],
  providers: [AccountRepository, AccountService],
  exports: [AccountService],
})
export class AccountModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`AccountModule.OnModuleInit`);
  }
}
