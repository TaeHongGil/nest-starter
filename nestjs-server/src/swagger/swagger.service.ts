import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenAPIObject, TagObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import ServerConfig from '@root/core/config/server.config';
import ServerLogger from '@root/core/server-logger/server.logger';
import { writeFileSync } from 'fs';
import path from 'path';
import { SwaggerUtil } from './swagger.utils';

@Injectable()
export class SwaggerService {
  constructor(readonly swaggerUtil: SwaggerUtil) {}

  metadata: Record<string, any>;
  document: OpenAPIObject;
  tags: TagObject[];

  getDocument(): OpenAPIObject {
    return this.document;
  }

  private async loadMetadata(): Promise<void> {
    const metadataPath = path.join(__dirname, 'metadata');
    try {
      const module = await import(metadataPath);
      const metadataFn = module.default;
      const resolvedMetadata = await metadataFn();
      await SwaggerModule.loadPluginMetadata(async () => resolvedMetadata);
      this.metadata = resolvedMetadata;
    } catch (error) {
      ServerLogger.error('Swagger Metadata Error:', error);
    }
  }

  async init(app: NestExpressApplication): Promise<void> {
    await this.loadMetadata();
    if (!this.metadata) {
      return;
    }
    this.swaggerUtil.applyDecorators(this.metadata);
    const documentOptions = new DocumentBuilder().build();
    const models = await Promise.all(this.metadata['@nestjs/swagger']['models'].map(async (model: any[]) => await model[0]));
    const modelMetadata = models.reduce((acc: any[], obj: any) => {
      obj = [...Object.values(obj)].filter((x) => typeof x == 'function');

      return [...acc, ...obj];
    }, []);

    this.document = SwaggerModule.createDocument(app, documentOptions, {
      extraModels: [...modelMetadata],
      autoTagControllers: true,
    });
    const apiPath = path.join(ServerConfig.paths.root, 'swagger', 'api-metadata.json');
    writeFileSync(apiPath, JSON.stringify(this.document, null, 2), 'utf-8');

    const socketData = this.swaggerUtil.getSocketMetadata(this.metadata);
    const socketPath = path.join(ServerConfig.paths.root, 'swagger', 'socket-metadata.json');
    writeFileSync(socketPath, JSON.stringify(socketData, null, 2), 'utf-8');
  }
}
