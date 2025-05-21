import { Injectable, applyDecorators } from '@nestjs/common';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ApiOperation } from '@nestjs/swagger';
import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { ParameterMetadataAccessor } from './utils/parameter-metadata-accessor';

@Injectable()
export class SwaggerUtil {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  loadSocketMetadata(): Record<string, Record<string, OperationObject>> {
    const filePath = path.join(__dirname, '..', '..', '..', 'src', 'feature', 'swagger', 'socket-metadata.json');
    if (!existsSync(filePath)) {
      return undefined;
    }
    const data = readFileSync(filePath, 'utf-8');

    return JSON.parse(data);
  }

  saveSocketMetadata(metadata: Record<string, any>): void {
    const result: Record<string, Record<string, OperationObject>> = {};

    const controllerMetadata = metadata['@nestjs/swagger']['controllers'].map((gateway: any[]) => gateway[1]).reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {});
    const providers = [...this.modulesContainer.values()]
      .flatMap((module) => {
        return [...module.providers.values()];
      })
      .filter((wrapper) => wrapper.instance);
    const uniqueProviders = Array.from(new Map(providers.map((wrapper) => [wrapper.instance.constructor, wrapper])).values());
    const paramsAccesor = new ParameterMetadataAccessor();
    uniqueProviders.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      const provider = instance.constructor;
      const gateWay = Reflect.getMetadata('websockets:is_gateway', provider);
      if (!gateWay) {
        return;
      }
      const prototype = Object.getPrototypeOf(instance);
      const option = Reflect.getMetadata('websockets:gateway_options', provider);
      const providerName = provider.name;
      if (option.namespace) {
        result[option.namespace] = {};
      }
      Object.getOwnPropertyNames(prototype).forEach((methodName) => {
        const method = prototype[methodName];
        if (typeof prototype[methodName] === 'function') {
          const isSubscribe = Reflect.getMetadata('websockets:message_mapping', method);
          if (isSubscribe) {
            const metadata = controllerMetadata?.[providerName]?.[methodName];
            const params = Object.values(paramsAccesor.explore(prototype, undefined, method));
            const message = Reflect.getMetadata('message', method);
            result[option.namespace][message] = {
              description: metadata?.['description'],
              requestBody:
                params && params.length > 0
                  ? {
                      content: {
                        'application/json': {
                          schema: {
                            $ref: `#/components/schemas/${params[0].type.name}`,
                          },
                        },
                      },
                    }
                  : undefined,
              responses: metadata
                ? {
                    '200': {
                      description: metadata?.['description'],
                      content: {
                        'application/json': {
                          schema: {
                            $ref: `#/components/schemas/${metadata?.type?.name}`,
                          },
                        },
                      },
                    },
                  }
                : {},
            };
          }
        }
      });
    });
    const filePath = path.join(__dirname, '..', '..', '..', 'src', 'feature', 'swagger', 'socket-metadata.json');
    writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf-8');
  }

  applyDecorators(metadata: Record<string, any>): void {
    const controllerMetadata = metadata['@nestjs/swagger']['controllers'].map((controller: any[]) => controller[1]).reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {});
    const controllers = [...this.modulesContainer.values()]
      .flatMap((module) => {
        return [...module.controllers.values()];
      })
      .filter((wrapper) => wrapper.instance);

    controllers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      const prototype = Object.getPrototypeOf(instance);
      const controller = instance.constructor;
      const controllerName = controller.name;

      Object.getOwnPropertyNames(prototype).forEach((methodName) => {
        const method = prototype[methodName];
        if (typeof method === 'function') {
          const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
          if (descriptor) {
            const methodMetadata = Reflect.getMetadata(METHOD_METADATA, method);
            if (methodMetadata != undefined) {
              const description = controllerMetadata?.[controllerName]?.[methodName]?.['description'];
              const operation = {
                ...Reflect.getMetadata('swagger/apiOperation', method),
                description,
              };
              applyDecorators(ApiOperation(operation))(prototype, methodName, descriptor);
            }
          }
        }
      });
    });
  }

  private getControllerTag(name: string): string {
    return name.replace('Controller', '').replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
