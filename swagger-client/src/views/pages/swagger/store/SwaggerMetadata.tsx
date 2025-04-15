import { METHOD_TYPE } from '@root/common/define/common.define';

export interface PathData {
  method: METHOD_TYPE;
  path: string;
}

class SwaggerMetadata {
  schema: Record<string, any>;
  paths: Record<string, Record<string, any>>;
  apis: Record<string, PathData[]>;

  constructor(metadata: any) {
    window.metadata = metadata;
    const spec = metadata.spec;
    this.schema = spec.components?.schemas;
    this.paths = spec.paths;
    6;
    this.apis = this.initApis();
  }

  private initApis(): Record<string, PathData[]> {
    const apis: Record<string, PathData[]> = {};

    for (const [path, methods] of Object.entries(this.paths)) {
      for (const [method, methodData] of Object.entries(methods)) {
        const ref = methodData.requestBody?.content?.['application/json']?.schema?.['$ref'];
        if (ref) {
          const name = this.getSchemaName(ref);
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
    return this.getPath(method, path)?.defaultSchema?.schema;
  }

  getChildSchema(method: string, path: string): any {
    const result: Record<string, any> = {};
    SwaggerMetadata.findAllValuesByKey(this.getDefaultSchema(method, path), '$ref').forEach((ref) => {
      const name = this.getSchemaName(ref);
      result[name] = this.getSchema(name);
    });
    return result;
  }

  getApis(): Record<string, PathData[]> {
    return this.apis;
  }

  getSchemaName(ref: string): string {
    return ref.split('/').pop() || '';
  }

  getSchema(name: string): any {
    return this.schema[name];
  }

  private static findAllValuesByKey(object: any, target: string): any[] {
    const result: any[] = [];

    function traverse(node: any) {
      if (Array.isArray(node)) {
        node.forEach(traverse);
      } else if (node !== null && typeof node === 'object') {
        Object.entries(node).forEach(([key, value]) => {
          if (key === target) {
            result.push(value);
          }
          traverse(value);
        });
      }
    }
    traverse(object);
    return result;
  }
}

export default SwaggerMetadata;
