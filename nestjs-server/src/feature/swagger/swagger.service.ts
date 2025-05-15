import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TagObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import ServerConfig from '@root/core/config/server.config';
import { SERVER_TYPE } from '@root/core/define/define';
import { ServerLogger } from '@root/core/server-log/server.log.service';
import { SwaggerDocument } from './swagger.dto';
import { SwaggerUtil } from './swagger.utils';

@Injectable()
export class SwaggerService {
  constructor(readonly swaggerUtil: SwaggerUtil) {}

  metadata: Record<string, any>;
  document: SwaggerDocument;
  tags: TagObject[];

  getDocument(): SwaggerDocument {
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
    let metadata: () => Promise<Record<string, any>>;
    const path = './metadata';
    try {
      const module = await import(path);
      metadata = module.default;
      const metadataCache: Promise<Record<string, any>> = metadata();
      const resolvedMetadata = await metadata();
      this.metadata = resolvedMetadata;
      this.tags = this.swaggerUtil.applyDecorators(resolvedMetadata);
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

    const swagger = SwaggerModule.createDocument(app, documentOptions, {
      extraModels: [...modelMetadata],
      deepScanRoutes: true,
    });
    swagger.tags = this.getTags();

    this.document = { ...swagger, socket: this.swaggerUtil.addSocketMetadata(this.metadata) };
  }
}
