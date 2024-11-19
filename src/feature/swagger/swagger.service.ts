import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { OpenAPIObject, TagObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import ServerConfig from '@root/core/config/server.config';
import { SERVER_TYPE } from '@root/core/define/define';
import { ServerLogger } from '@root/core/server-log/server.log.service';
import SwaggerConfig from './swagger.config';
import { SwaggerUtilService } from './swagger.utils.service';

@Injectable()
export class SwaggerService {
  constructor(readonly swaggerUtilService: SwaggerUtilService) {}

  metadata: Record<string, any>;
  document: OpenAPIObject;
  tags: TagObject[];

  getDocument(): OpenAPIObject {
    return this.document;
  }

  getTags(): TagObject[] {
    return this.tags;
  }

  /**
   * Swagger Setup
   */
  async onBeforeModuleInit(app: NestExpressApplication): Promise<void> {
    if (ServerConfig.serverType == SERVER_TYPE.LIVE) {
      return;
    }
    SwaggerConfig.init();
    let metadata: () => Promise<Record<string, any>>;
    const path = './metadata';
    try {
      const module = await import(path);
      metadata = module.default;
      const metadataCache: Promise<Record<string, any>> = metadata();
      const resolvedMetadata = await metadata();
      this.metadata = resolvedMetadata;
      this.tags = this.swaggerUtilService.applyDecorators(resolvedMetadata);
      await SwaggerModule.loadPluginMetadata(async () => metadataCache);
    } catch (error) {
      ServerLogger.error('Swagger Metadata Error:', error);

      return;
    }
    app.setViewEngine('ejs');

    //옵션 설정
    const documentOptions = new DocumentBuilder().setTitle('API Document').setDescription('').build();

    //extraModels 추가
    const models = await Promise.all(this.metadata['@nestjs/swagger']['models'].map(async (model: any[]) => await model[0]));
    const modelMetadata = models.reduce((acc: any[], obj: any) => {
      obj = [...Object.values(obj)].filter((x) => typeof x == 'function');

      return [...acc, ...obj];
    }, []);

    //spec생성
    this.document = SwaggerModule.createDocument(app, documentOptions, {
      include: SwaggerConfig.options.includeModules,
      extraModels: [...modelMetadata],
      deepScanRoutes: true,
    });
    this.document.tags = this.getTags();
  }
}
