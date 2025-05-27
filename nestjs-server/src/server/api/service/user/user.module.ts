import { Module, OnModuleInit } from '@nestjs/common';
import ServerLogger from '@root/core/server-log/server.logger';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`UserModule.OnModuleInit`);
  }
}
