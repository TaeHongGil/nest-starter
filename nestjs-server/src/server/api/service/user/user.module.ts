import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import ServerLogger from '@root/core/server-logger/server.logger';
import { UserRepository } from './user.repository';
import { DBUser, DBUserSchema } from './user.schema';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: DBUser.name, schema: DBUserSchema }])],
  controllers: [],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`UserModule.OnModuleInit`);
  }
}
