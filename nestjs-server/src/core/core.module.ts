import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module, Type, type OnModuleInit } from '@nestjs/common';
import { readdirSync } from 'fs';
import path from 'path';
import { AuthModule } from './auth/auth.module';
import { MongoModule } from './mongo/mongo.modules';
import { RedisModule } from './redis/redis.modules';
import ServerLogger from './server-logger/server.logger';

@Module({
  imports: [MongoModule, RedisModule.forRootAsync(), CacheModule.register({ isGlobal: true }), AuthModule],
  providers: [],
  exports: [],
})
export class CoreModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`CoreModule.onModuleInit`);
  }

  static registerDynamic(t: Type<any>, target_path: string, end_with_file_name: string, type: 'controllers' | 'providers' | 'imports'): DynamicModule {
    const files = readdirSync(target_path).filter((file) => file.endsWith(`${end_with_file_name}.js`) || file.endsWith(`${end_with_file_name}.ts`));
    const classes: any[] = files.map((file) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require(path.join(target_path, file));
      const clazz = Object.values(mod).find((item) => typeof item === 'function');

      return clazz;
    });

    for (const c of classes) {
      ServerLogger.log(`Added ${t.name} ${type} = ${c.name}`);
    }

    const result: DynamicModule = {
      module: t,
    };
    result[type] = classes;

    return result;
  }
}
