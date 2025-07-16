import { Global, Module, OnModuleInit } from '@nestjs/common';
import { GoogleAccountService } from '@root/core/google/google.account.service';
import { GoogleSheetService } from '@root/core/google/google.sheet.service';
import ServerLogger from '@root/core/server-logger/server.logger';

@Global()
@Module({
  imports: [],
  providers: [GoogleAccountService, GoogleSheetService],
  exports: [GoogleAccountService, GoogleSheetService],
})
export class GoogleModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('GoogleModule.onModuleInit');
  }
}
