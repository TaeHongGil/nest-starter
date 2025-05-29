import { Module, OnModuleInit } from '@nestjs/common';
import ServerLogger from '@root/core/server-logger/server.logger';
import { MQTestModule } from './test/mq.test.module';

const importModules = [MQTestModule];

@Module({
  imports: [...importModules],
  providers: [],
  exports: [...importModules],
})
export class MQServiceModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`MQServiceModule.OnModuleInit`);
  }
}
