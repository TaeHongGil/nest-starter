import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule } from '@root/core/core.module';
import path from 'path';
import { AccountModule } from './service/account/account.module';

@Module({
  imports: [AccountModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ServerModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await CoreModule.registerControllerAsync(ServerModule, path.join(__dirname, 'controller'), '.controller');
  }
}
