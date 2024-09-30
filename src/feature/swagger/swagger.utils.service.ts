import { Injectable, applyDecorators } from '@nestjs/common';
import { INTERCEPTORS_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TagObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { SwaggerConfigService } from './swagger.config.service';

@Injectable()
export class SwaggerUtilService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly reflector: Reflector,
    private readonly swaggerConfig: SwaggerConfigService,
  ) {}

  applyDecorators(metadata: Record<string, any>): TagObject[] {
    const controllerMetadata = metadata['@nestjs/swagger']['controllers'].map((controller: any[]) => controller[1]).reduce((acc: any, obj: any) => ({ ...acc, ...obj }), {});
    const includeModules = this.swaggerConfig.options.includeModules.map((x) => x.name);
    const controllers = [...this.modulesContainer.values()]
      .flatMap((module) => {
        if (includeModules.includes(module.metatype?.name)) {
          return [...module.controllers.values()];
        }

        return [];
      })
      .filter((wrapper) => wrapper.instance);

    const tags: TagObject[] = [];
    controllers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      const prototype = Object.getPrototypeOf(instance);
      const controller = instance.constructor;
      const controllerName = controller.name;

      if (!this.reflector.get('swagger/apiExcludeController', controller)) {
        const tag = this.getControllerTag(controllerName);
        ApiTags(tag)(controller);
        tags.push({ name: tag });
      }

      const controllerInterceptorMetadata = this.reflector.get(INTERCEPTORS_METADATA, controller) || [];
      Object.getOwnPropertyNames(prototype).forEach((methodName) => {
        const method = prototype[methodName];
        const descriptor = Object.getOwnPropertyDescriptor(prototype, methodName);
        if (descriptor) {
          const methodMetadata = Reflect.getMetadata(METHOD_METADATA, method);
          if (methodMetadata != undefined) {
            const descriptions = controllerMetadata?.[controllerName]?.[methodName]?.['description'];
            if (descriptions) {
              const [summary, description] = descriptions.split('===').map((part: string) => part.trim());
              const methodInterceptorMetadata = this.reflector.get(INTERCEPTORS_METADATA, method) || [];
              const interceptorsMetadata = [...controllerInterceptorMetadata, ...methodInterceptorMetadata];
              const interceptors = this.getInterceptors(interceptorsMetadata);
              const operation = {
                ...this.reflector.get('swagger/apiOperation', method),
                summary: `${summary}`,
                description: description,
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

  private getInterceptors(interceptorsMetadata: any[]): string[] {
    const interceptors = interceptorsMetadata.reduce((acc, interceptor) => {
      return interceptor.name;
    }, new Set<string>());

    return Array.from(interceptors);
  }
}
