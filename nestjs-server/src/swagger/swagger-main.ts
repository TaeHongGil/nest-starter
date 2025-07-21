import { PluginMetadataGenerator } from '@nestjs/cli/lib/compiler/plugins/plugin-metadata-generator';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ReadonlyVisitor } from '@nestjs/swagger/dist/plugin';

import ServerConfig from '@root/core/config/server.config';
import { CoreModule } from '@root/core/core.module';
import ServerLogger from '@root/core/server-logger/server.logger';
import { ApiModule } from '@root/server/api/api.module';
import { WsModule } from '@root/server/ws/ws.module';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { CustomSwaggerModule } from './swagger.module';
import { SwaggerService } from './swagger.service';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('UTC');

@Module({
  imports: [CoreModule, ApiModule, WsModule, CustomSwaggerModule],
})
export class SwaggerAppModule {}

async function bootstrap(): Promise<void> {
  try {
    generateSwaggerMetadata();

    const app = await NestFactory.create<NestExpressApplication>(SwaggerAppModule);
    const swagger = app.get(SwaggerService);
    await swagger.init(app);
    process.exit(0);
  } catch (error) {
    ServerLogger.error(`Swagger bootstrap error: ${error?.message}`, error?.stack);
    process.exit(1);
  }
}

function generateSwaggerMetadata(): void {
  const metadataFolder = path.join(ServerConfig.paths.root, 'swagger');
  const metadataFile = path.join(metadataFolder, 'metadata.ts');
  if (existsSync(metadataFile)) {
    unlinkSync(metadataFile);
  }
  const generator = new PluginMetadataGenerator();
  generator.generate({
    visitors: [
      new ReadonlyVisitor({
        dtoFileNameSuffix: ['.schema.ts', '.dto.ts'],
        controllerFileNameSuffix: ['.controller.ts', '.gateway.ts'],
        classValidatorShim: true,
        pathToSource: metadataFolder,
        controllerKeyOfComment: 'description',
        introspectComments: true,
      }),
    ],
    outputDir: metadataFolder,
    tsconfigPath: './tsconfig.json',
  });
}

bootstrap().catch((err) => {
  process.exit(1);
});
