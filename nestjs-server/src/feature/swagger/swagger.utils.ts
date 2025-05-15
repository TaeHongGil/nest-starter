import { Injectable, applyDecorators } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { SocketMetadata } from './swagger.dto';
import { ParameterMetadataAccessor } from './utils/parameter-metadata-accessor';

@Injectable()
export class SwaggerUtil {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  addSocketMetadata(metadata: Record<string, any>): SocketMetadata {
    const result: SocketMetadata = {
      events: {},
    };

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
      Object.getOwnPropertyNames(prototype).forEach((methodName) => {
        const method = prototype[methodName];
        if (typeof prototype[methodName] === 'function') {
          const isSubscribe = Reflect.getMetadata('websockets:message_mapping', method);
          if (isSubscribe) {
            const params = paramsAccesor.explore(prototype, undefined, method);
            const message = Reflect.getMetadata('message', method);
            result.events[message] = {
              description: controllerMetadata?.[providerName]?.[methodName]?.['description'],
              responses: {},
            };
          }
        }
      });
    });

    return result;
  }

  applyDecorators(metadata: Record<string, any>): TagObject[] {
    const controllerMetadata = metadata['@nestjs/swagger']['controllers'].map((controller: any[]) => controller[1]).reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {});
    const controllers = [...this.modulesContainer.values()]
      .flatMap((module) => {
        return [...module.controllers.values()];
      })
      .filter((wrapper) => wrapper.instance);

    const tags: TagObject[] = [];
    controllers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      const prototype = Object.getPrototypeOf(instance);
      const controller = instance.constructor;
      const controllerName = controller.name;

      if (!Reflect.getMetadata('swagger/apiExcludeController', controller)) {
        const tag = this.getControllerTag(controllerName);
        ApiTags(tag)(controller);
        tags.push({ name: tag });
      }

      const controllerGuardMetadata = Reflect.getMetadata(GUARDS_METADATA, controller) || [];
      Object.getOwnPropertyNames(prototype).forEach((methodName) => {
        const method = prototype[methodName];
        if (typeof method === 'function') {
          const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
          if (descriptor) {
            const methodMetadata = Reflect.getMetadata(METHOD_METADATA, method);
            if (methodMetadata != undefined) {
              const description = controllerMetadata?.[controllerName]?.[methodName]?.['description'];
              const methodGuardMetadata = Reflect.getMetadata(GUARDS_METADATA, method) || [];
              const interceptorsMetadata = [...controllerGuardMetadata, ...methodGuardMetadata];
              const interceptors = this.getGuard(interceptorsMetadata);
              const operation = {
                ...Reflect.getMetadata('swagger/apiOperation', method),
                description,
                security: interceptors,
              };
              applyDecorators(ApiOperation(operation))(prototype, methodName, descriptor);
            }
          }
        }
      });
    });

    return tags;
  }

  private getControllerTag(name: string): string {
    return name.replace('Controller', '').replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  private getGuard(interceptorsMetadata: any[]): string[] {
    const interceptors = interceptorsMetadata.reduce((acc, interceptor) => {
      const summary = Reflect.getMetadata('swagger/summary', interceptor);
      acc.add(summary);

      return acc;
    }, new Set<string>());

    return Array.from(interceptors);
  }
}
