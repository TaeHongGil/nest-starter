import { RequestMethod, SetMetadata, applyDecorators } from '@nestjs/common';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiExcludeController, ApiExtraModels, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { promises as fs } from 'fs';
import { dirname, join } from 'path';

let useDeafult = false;
let responsePath = '';

export function setStaticPath(path: string): void {
  responsePath = path;
}

export function setUseDefault(option: boolean): void {
  useDeafult = option;
}

export async function responseSave(req: any, res: any): Promise<void> {
  try {
    let body = '';
    req.on('data', (chunk: { toString: () => string }) => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const response = JSON.parse(body);
        const filePath = join(responsePath, `${response.url}.txt`);
        const dir = dirname(filePath);

        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(response.body, null, 2), 'utf8');
      } catch (error) {
        console.error(error);
      }
      res.status(200).send('Response saved successfully');
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save response' });
  }
}

export async function getFileList(req: any, res: any): Promise<void> {
  try {
    await fs.mkdir(responsePath, { recursive: true });
    const files = await getAllFiles(responsePath);

    const fileContents: { [key: string]: any } = {};

    for (const file of files) {
      const content = await fs.readFile(join(responsePath, file), 'utf-8');
      fileContents[file] = content;
    }

    res.json(fileContents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read folder' });
  }
}

/**
 * 주어진 디렉토리의 모든 파일과 폴더를 재귀적으로 읽어오는 함수
 */
async function getAllFiles(dirPath: string, basePath = '', arrayOfFiles: string[] = []): Promise<string[]> {
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    const filePath = join(dirPath, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await getAllFiles(filePath, join(basePath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push(join(basePath, file)); // 파일 경로 추가
    }
  }
  return arrayOfFiles;
}

/**
 * 모든 Controller 및 Post에 Decorator적용
 */
export async function applyCommonDecorators(app: NestExpressApplication, metadata: Record<string, any>): Promise<void> {
  const controllerMetadata = metadata['@nestjs/swagger']['controllers']
    .map((controller: any[]) => controller[1])
    .reduce((acc: any, obj: any) => {
      return { ...acc, ...obj };
    }, {});

  const modulesContainer = app.get(ModulesContainer);

  const controllers = [...modulesContainer.values()].map((module) => [...module.controllers.values()]).flat();

  controllers.forEach((wrapper: InstanceWrapper) => {
    const { instance } = wrapper;
    if (!instance) {
      return;
    }

    //Controller에 ApiTags 적용
    const prototype = Object.getPrototypeOf(instance);
    if (instance.constructor && !Reflect.getMetadata(ApiExcludeController, instance.constructor)) {
      const tag = instance.constructor.name.replace('Controller', '').replace(/([a-z])([A-Z])/g, '$1 $2');
      ApiTags(tag)(instance.constructor);
    }

    Object.getOwnPropertyNames(prototype).forEach((methodName) => {
      const method = prototype[methodName];
      const methodMetadata = Reflect.getMetadata(METHOD_METADATA, method);

      if (methodMetadata && methodMetadata === RequestMethod.POST) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
        if (descriptor) {
          //swaggerResponse
          const swaggerResponse = Reflect.getMetadata('swaggerResponse', method) ?? {};
          const returnType = controllerMetadata?.[instance.constructor.name]?.[methodName]?.['type'];
          if (returnType) {
            applyDecorators(SetMetadata('returnType', returnType))(prototype, methodName, descriptor);
          }
          applyDecorators(SwaggerResponse(swaggerResponse))(prototype, methodName, descriptor);
          Object.defineProperty(prototype, methodName, descriptor);

          //ApiOperation
          const summary = controllerMetadata?.[instance.constructor.name]?.[methodName]?.['summary'];
          if (summary) {
            const operation = Reflect.getMetadata('swagger/apiOperation', method) || {};
            operation.summary = summary;
            applyDecorators(ApiOperation(operation));
          }
        }
      }
    });
  });
}

/**
 * Swagger Response 데코레이터
 */
export function SwaggerResponse(datas: Record<string, any> = {}): MethodDecorator {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor): void => {
    // const returnType = Reflect.getMetadata('returnType', target[propertyKey]);
    const funcs: any[] = [];
    const properties = {};

    makeProperties(datas, funcs, properties);
    ApiExtraModels(...funcs)(target, propertyKey, descriptor);

    if (Object.keys(properties).length !== 0 && properties.constructor === Object) {
      ApiResponse({
        schema: {
          properties: properties,
        },
      })(target, propertyKey, descriptor);
    } else {
      if (!useDeafult) {
        ApiResponse({})(target, propertyKey, descriptor);
      }
    }
    SetMetadata('swaggerResponse', datas)(target, propertyKey, descriptor);
  };
}

/**
 * Properties 생성
 */
function makeProperties(datas: any, funcs: any[], result: object): void {
  if (!datas) {
    return;
  }
  Object.entries(datas).forEach(([key, data]) => {
    if (typeof data == 'object' && !Array.isArray(data)) {
      if (!result[key]) {
        result[key] = {};
        result[key]['properties'] = {};
      }
      makeProperties(data, funcs, result[key]['properties']);
    } else if (typeof data === 'function') {
      funcs.push(data);
      result[key] = { $ref: getSchemaPath(data) };
    } else {
      result[key] = { default: data };
    }
  });
}
