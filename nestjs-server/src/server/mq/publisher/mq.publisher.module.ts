import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '../../../core/server-log/server.logger';
import { MQCoreModule } from '../mq.core.module';
import { MQServiceModule } from './service/mq.service.module';

@Global()
@Module({
  imports: [MQCoreModule, MQServiceModule],
  providers: [],
  exports: [MQServiceModule],
})
export class MQPublisherModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`MQPublisherModule.onModuleInit`);
  }
}
