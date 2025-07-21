import { Injectable, applyDecorators } from '@nestjs/common';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ApiOperation } from '@nestjs/swagger';
import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ParameterMetadataAccessor } from './utils/parameter-metadata-accessor';

@Injectable()
export class SwaggerUtil {
  constructor(private readonly discoveryService: DiscoveryService) {}

  getSocketMetadata(metadata: Record<string, any>): Record<string, Record<string, OperationObject>> {
    const result: Record<string, Record<string, OperationObject>> = {};

    const controllerMetadata = metadata['@nestjs/swagger']['controllers'].map((gateway: any[]) => gateway[1]).reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {});
    const providers = this.discoveryService.getProviders();
    const paramsAccesor = new ParameterMetadataAccessor();
    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (!instance) {
        return;
      }

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

    return result;
  }

  applyDecorators(metadata: Record<string, any>): void {
    const controllerMetadata = metadata['@nestjs/swagger']['controllers'].map((controller: any[]) => controller[1]).reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {});
    const controllers = this.discoveryService.getControllers();

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
}
