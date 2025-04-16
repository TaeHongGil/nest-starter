import { METHOD_TYPE } from '@root/common/define/common.define';
import CommonUtil from '@root/common/util/common.util';

export interface PathData {
  method: METHOD_TYPE;
  path: string;
}

class SwaggerMetadata {
  schema: Record<string, any> = {};
  paths: Record<string, Record<string, any>> = {};
  apis: Record<string, PathData[]> = {};

  constructor(metadata: any) {
    window.metadata = metadata;
    const spec = metadata.spec;
    this.schema = spec.components?.schemas;
    this.paths = spec.paths;
    this.apis = this.initApis();
  }

  private initApis(): Record<string, PathData[]> {
    const apis: Record<string, PathData[]> = {};

    for (const [path, methods] of Object.entries(this.paths)) {
      for (const [method, methodData] of Object.entries(methods)) {
        const ref = methodData.requestBody?.content?.['application/json']?.schema?.['$ref'];
        if (ref) {
          const name = SwaggerMetadata.getSchemaName(ref);
          methodData.defaultSchema = {
            name,
            schema: this.getSchema(name),
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

  getPath(method: string, path: string): any {
    return this.paths[path]?.[method.toLowerCase()];
  }

  getDefaultSchema(method: string, path: string): any {
    return this.getPath(method, path)?.defaultSchema;
  }

  getChildSchema(method: string, path: string): any {
    const result: Record<string, any> = {};
    CommonUtil.findAllValuesByKey(this.getDefaultSchema(method, path).schema, '$ref').forEach((ref) => {
      const name = SwaggerMetadata.getSchemaName(ref);
      result[name] = this.getSchema(name);
    });
    return result;
  }

  getApis(): Record<string, PathData[]> {
    return this.apis;
  }

  static getSchemaName(ref: string): string {
    return ref.split('/').pop() || '';
  }

  getSchema(name: string): any {
    return this.schema[name];
  }
}

export default SwaggerMetadata;
