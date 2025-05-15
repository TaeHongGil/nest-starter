import { Global, Module, type OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '../server-log/server.log.service';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { SocketAuthService } from './socket.auth.service';

@Global()
@Module({
  imports: [],
  providers: [AuthService, SocketAuthService, AuthRepository],
  exports: [AuthService, SocketAuthService],
})
export class AuthModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('SessionModule.onModuleInit');
  }
}
