import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';

@Global()
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class CoreModule implements OnModuleInit {
  async onModuleInit() {
    Logger.log(`CoreModule.onModuleInit`);
  }
}
