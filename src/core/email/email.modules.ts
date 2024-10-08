import { Global, Module, type OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '../server-log/server.log.service';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('EmailModule.onModuleInit');
  }
}
