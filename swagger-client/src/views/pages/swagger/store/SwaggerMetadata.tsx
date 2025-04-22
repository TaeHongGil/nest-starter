import { METHOD_TYPE } from '@root/common/define/common.define';
import CommonUtil from '@root/common/util/common.util';
import MessageUtil from '@root/common/util/message.util';
import JSON5 from 'json5';

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

  static formatJson(jsonString: string, schema: any, targetPath: string = ''): string {
    try {
      if (!jsonString || !schema) {
        return jsonString;
      }
      const parsed = JSON5.parse(jsonString);
      const format = SwaggerMetadata.addComment(parsed, schema, targetPath);
      return format;
    } catch (e: any) {
      MessageUtil.error('Failed to format JSON.');
      console.error(e);
      return jsonString;
    }
  }

  static toSchemaObject(schema: any): Record<string, any> {
    const result: Record<string, any> = {};
    for (const field in schema.properties) {
      const data = schema.properties[field];
      if (data.default != undefined) result[field] = data.default;
      else if (data.type == 'array') result[field] = [];
      else if (data.type == 'boolean') result[field] = false;
      else if (data.type == 'number') result[field] = 0;
      else if (data.type == 'string') result[field] = 'string';
      else if (data.type == 'date-time') result[field] = new Date().toString();
      else if (data.type == 'object') result[field] = {};
      else {
        CommonUtil.findAllValuesByKey(data, '$ref').forEach((ref: string) => {
          const schema = SwaggerMetadata.getSchema(SwaggerMetadata.getSchemaName(ref));
          result[field] = SwaggerMetadata.toSchemaObject(schema);
        });
      }
    }
    return result;
  }

  static toSchemaString(schema: any): string {
    if (!schema || !schema.properties) {
      return '{\n}';
    }
    const resultObject = SwaggerMetadata.toSchemaObject(schema);
    return SwaggerMetadata.addComment(resultObject, schema);
  }

  static addComment(object: any, schema: any, targetPath: string = ''): string {
    const lines: string[] = [];

    const traverse = (obj: any, currentPath: string[], depth: number = 1): string[] => {
      const result: string[] = [];
      Object.entries(obj).forEach(([key, value]) => {
        const isObject = typeof value === 'object' && !Array.isArray(value);
        const isTarget = currentPath.join('.') === targetPath;

        const description = isTarget ? schema?.properties?.[key]?.description : '';
        const comment = description ? ` // ${description}` : '';

        if (isObject) {
          result.push(`${'  '.repeat(depth)}"${key}": {`);
          result.push(...traverse(value, [...currentPath, key], depth + 1));
          result.push(`${'  '.repeat(depth)}}${comment ? ',' + comment : ','}`);
        } else {
          const valueStr = JSON.stringify(value, null, 2).replaceAll(/\n/g, '\n' + '  '.repeat(depth));
          result.push(`${'  '.repeat(depth)}"${key}": ${valueStr}${comment ? ',' + comment : ','}`);
        }
      });
      return result;
    };

    lines.push(`{`);
    lines.push(...traverse(object, []));
    lines.push(`}`);

    return lines.join('\n');
  }
}

export default SwaggerMetadata;
