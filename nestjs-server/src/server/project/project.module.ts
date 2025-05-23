import { Module, OnModuleInit } from '@nestjs/common';
import { CoreModule } from '@root/core/core.module';
import { ServerLogger } from '@root/core/server-log/server.log.service';
import path from 'path';
import { UserModule } from './service/user/user.module';

@Module({
  imports: [UserModule, CoreModule.registerDynamic(ProjectModule, path.join(__dirname, 'controller'), '.controller', 'controllers')],
  providers: [],
  exports: [],
})
export class ProjectModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`ProjectModule.OnModuleInit`);
  }
}
