import { Global, Module, type OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '../server-log/server.log.service';
import { MysqlService } from './mysql.service';

@Global()
@Module({
  imports: [],
  providers: [MysqlService],
  exports: [MysqlService],
})
export class MysqlModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('MysqlModule.onModuleInit');
  }
}
