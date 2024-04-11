import { DynamicModule, Global, Module, Type, type OnModuleInit } from '@nestjs/common';
import { readdirSync } from 'fs';
import path from 'path';
import { MongoModule } from './mongo/mongo.modules';
import { MysqlModule } from './mysql/mysql.modules';
import { RedisModule } from './redis/redis.modules';
import { ServerLogger } from './server-log/server.log.service';

@Global()
@Module({
  imports: [MongoModule, MysqlModule, RedisModule],
  providers: [],
  exports: [],
})
export class CoreModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`CoreModule.onModuleInit`);
  }

  static registerController(t: Type<any>, controller_path: string, end_with_file_name: string): DynamicModule {
    const controllersPath = controller_path;
    const controllerFiles = readdirSync(controllersPath).filter((file) => file.endsWith(`${end_with_file_name}.js`) || file.endsWith(`${end_with_file_name}.ts`));
    const controllers: any[] = controllerFiles.map((file) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const controllerModule = require(path.join(controllersPath, file));
      const controllerClass = Object.values(controllerModule).find((item) => typeof item === 'function');
      return controllerClass;
    });

    for (const ct of controllers) {
      ServerLogger.log(`Added ${t.name} Controller = ${ct.name}`);
    }

    return {
      module: t,
      controllers: controllers,
    };
  }
}
