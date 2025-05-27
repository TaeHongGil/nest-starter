import { Global, Module, OnModuleInit } from '@nestjs/common';
import ServerLogger from '../server-log/server.logger';
import { HttpMiddleware } from './http.middleware';

@Global()
@Module({
  imports: [],
  providers: [HttpMiddleware],
  exports: [HttpMiddleware],
})
export class MiddleWareModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`MiddleWareModule.onModuleInit`);
  }
}
