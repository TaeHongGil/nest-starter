import { Global, Module, type OnModuleInit } from '@nestjs/common';
import { ServerLogger } from '../server-log/server.log.service';
import { MongoService } from './mongo.service';

@Global()
@Module({
  imports: [],
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log('MongoModule.onModuleInit');
  }
}
