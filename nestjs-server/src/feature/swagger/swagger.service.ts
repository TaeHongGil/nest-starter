import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenAPIObject, TagObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import ServerConfig from '@root/core/config/server.config';
import { SERVER_TYPE } from '@root/core/define/define';
import { ServerLogger } from '@root/core/server-log/server.log.service';
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

  getTags(): TagObject[] {
    return this.tags;
  }

  private async loadMetadata(): Promise<void> {
    if (ServerConfig.serverType == SERVER_TYPE.LIVE) {
      return;
    }

    const path = './metadata';
    try {
      const module = await import(path);
      const metadataFn = module.default;
      const resolvedMetadata = await metadataFn();
      await SwaggerModule.loadPluginMetadata(async () => resolvedMetadata);
      this.metadata = resolvedMetadata;
    } catch (error) {
      ServerLogger.error('Swagger Metadata Error:', error);
    }
  }

  async APIServerInit(app: NestExpressApplication): Promise<void> {
    await this.loadMetadata();
    if (!this.metadata) {
      return;
    }
    this.tags = this.swaggerUtil.applyDecorators(this.metadata);

    const documentOptions = new DocumentBuilder().build();
    const models = await Promise.all(this.metadata['@nestjs/swagger']['models'].map(async (model: any[]) => await model[0]));
    const modelMetadata = models.reduce((acc: any[], obj: any) => {
      obj = [...Object.values(obj)].filter((x) => typeof x == 'function');

      return [...acc, ...obj];
    }, []);

    this.document = SwaggerModule.createDocument(app, documentOptions, {
      extraModels: [...modelMetadata],
      deepScanRoutes: true,
    });
    this.document.tags = this.getTags();
  }

  async SocketServerInit(): Promise<void> {
    await this.loadMetadata();
    if (!this.metadata) {
      return;
    }
    this.swaggerUtil.saveSocketMetadata(this.metadata);
  }
}
