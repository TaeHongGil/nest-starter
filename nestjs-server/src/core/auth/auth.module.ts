import { Global, Module, type OnModuleInit } from '@nestjs/common';
import ServerLogger from '../server-log/server.logger';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { WsAuthService } from './ws.auth.service';

@Global()
@Module({
  imports: [],
  providers: [AuthService, WsAuthService, AuthRepository],
  exports: [AuthService, WsAuthService],
})
export class AuthModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('SessionModule.onModuleInit');
  }
}
