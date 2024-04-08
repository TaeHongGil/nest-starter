import { DynamicModule, Global, Module, Type, type OnModuleInit } from '@nestjs/common';
import { readdirSync } from 'fs';
import path from 'path';
import { MongoModule } from './mongo/mongo.modules';
import { ServerLogger } from './server-log/server.log.service';

@Global()
@Module({
  imports: [MongoModule],
  providers: [],
  exports: [],
})
export class CoreModule implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    ServerLogger.log(`CoreModule.onModuleInit`);
  }

  static async registerControllerAsync(t: Type<any>, controller_path: string, end_with_file_name: string): Promise<DynamicModule> {
    const controllersPath = controller_path;
    const controllerFiles = readdirSync(controllersPath).filter((file) => file.endsWith(`${end_with_file_name}.js`) || file.endsWith(`${end_with_file_name}.ts`));

    const controllers = await Promise.all(
      controllerFiles.map(async (file) => {
        const controllerModule = await import(path.join(controllersPath, file));
        const controllerClass = Object.values(controllerModule).find((item) => typeof item === 'function') as Type<any>;
        return controllerClass;
      }),
    );

    controllers.forEach((ct) => {
      ServerLogger.log(`Added ${t.name} Controller = ${ct.name}`);
    });

    return {
      module: t,
      controllers: controllers,
    };
  }
}
