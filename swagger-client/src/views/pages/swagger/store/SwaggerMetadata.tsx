import { METHOD_TYPE } from '@root/common/define/common.define';
import CommonUtil from '@root/common/util/common.util';

/**
 * Swagger 옵션
 */
export interface SwaggerOptions {
  version?: string;
  token?: Record<string, string>;
  header?: Record<string, any>;
}

export interface PathData {
  method: METHOD_TYPE;
  path: string;
}

class SwaggerMetadata {
  static schema: Record<string, any>;
  static paths: Record<string, Record<string, any>>;
  static apis: Record<string, PathData[]>;
  static servers: Record<string, string> = {};
  static config: SwaggerOptions;

  static init(metadata: any) {
    window.metadata = metadata;
    console.log(metadata);
    const spec = metadata.spec;
    SwaggerMetadata.schema = spec.components?.schemas;
    SwaggerMetadata.paths = spec.paths;
    SwaggerMetadata.apis = SwaggerMetadata.initApis();
    SwaggerMetadata.servers = metadata.servers;
    SwaggerMetadata.config = metadata.config;
  }

  private static initApis(): Record<string, PathData[]> {
    const apis: Record<string, PathData[]> = {};

    for (const [path, methods] of Object.entries(SwaggerMetadata.paths)) {
      for (const [method, methodData] of Object.entries(methods)) {
        const ref = methodData.requestBody?.content?.['application/json']?.schema?.['$ref'];
        if (ref) {
          const name = SwaggerMetadata.getSchemaName(ref);
          methodData.defaultSchema = {
            name,
            schema: SwaggerMetadata.getSchema(name),
          };
        }

        const [controller] = methodData.tags || [];
        if (controller) {
          if (!apis[controller]) apis[controller] = [];
          apis[controller].push({ method: method.toUpperCase() as METHOD_TYPE, path });
        }
      }
    }

    return apis;
  }

  static getPath(method: string, path: string): any {
    return SwaggerMetadata.paths[path]?.[method.toLowerCase()];
  }

  static getDefaultSchema(method: string, path: string): any {
    return SwaggerMetadata.getPath(method, path)?.defaultSchema;
  }

  static getChildSchema(method: string, path: string): any {
    const result: Record<string, any> = {};
    CommonUtil.findAllValuesByKey(SwaggerMetadata.getDefaultSchema(method, path).schema, '$ref').forEach((ref) => {
      const name = SwaggerMetadata.getSchemaName(ref);
      result[name] = SwaggerMetadata.getSchema(name);
    });
    return result;
  }

  static getApis(): Record<string, PathData[]> {
    return SwaggerMetadata.apis;
  }

  static getSchemaName(ref: string): string {
    return ref.split('/').pop() || '';
  }

  static getSchema(name: string): any {
    return SwaggerMetadata.schema[name];
  }
}

export default SwaggerMetadata;
