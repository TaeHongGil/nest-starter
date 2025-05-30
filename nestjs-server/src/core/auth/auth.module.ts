import { Global, Module, type OnModuleInit } from '@nestjs/common';
import ServerLogger from '../server-logger/server.logger';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [],
  providers: [AuthService, AuthRepository],
  exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('SessionModule.onModuleInit');
  }
}
