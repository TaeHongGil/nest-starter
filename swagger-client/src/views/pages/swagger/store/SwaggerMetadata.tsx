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

export interface PathInfo {
  method: METHOD_TYPE;
  path: string;
}

export interface EventInfo {
  namespace: string;
  event: string;
}

export interface ServerUrl {
  api: string;
  socket: string;
}

export interface DefaultSchema {
  name?: string;
  schema?: any;
}

class SwaggerMetadata {
  static schema: Record<string, any>;
  static paths: Record<string, Record<string, any>>;
  static apis: Record<string, PathInfo[]>;
  static servers: Record<string, ServerUrl> = {};
  static namespaces: Record<string, string[]> = {};
  static sockets: Record<string, Record<string, any>> = {};
  static config: SwaggerOptions;
  static init: boolean = false;

  static initialize(metadata: any): void {
    window.metadata = metadata;
    console.log(metadata);
    const spec = metadata.spec;
    this.schema = spec.components?.schemas;
    this.servers = metadata.servers;
    this.config = metadata.config;

    this.paths = spec.paths;
    this.apis = this.initApis();

    this.sockets = spec.sockets;
    this.namespaces = this.initSockets();
    this.init = true;
  }

  private static initApis(): Record<string, PathInfo[]> {
    const apis: Record<string, PathInfo[]> = {};

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

  private static initSockets(): Record<string, string[]> {
    if (!this.sockets) {
      return {};
    }

    const namespaces: Record<string, string[]> = {};

    for (const [namespace, event] of Object.entries(this.sockets)) {
      for (const [eventName, eventInfo] of Object.entries(event)) {
        const ref = eventInfo.requestBody?.content?.['application/json']?.schema?.['$ref'];
        if (ref) {
          const name = this.getSchemaName(ref);
          eventInfo.defaultSchema = {
            name,
            schema: this.getSchema(name),
          };
        }

        if (!namespaces[namespace]) namespaces[namespace] = [];
        namespaces[namespace].push(eventName);
      }
    }

    return namespaces;
  }

  static getPath(method: string, path: string): any {
    return this.paths?.[path]?.[method.toLowerCase()];
  }

  static getEvent(namespace: string, event: string): any {
    return this.sockets?.[namespace]?.[event];
  }

  static getApis(): Record<string, PathInfo[]> {
    return this.apis;
  }

  static getEvents(): Record<string, string[]> {
    return this.namespaces;
  }

  static getSchemaName(ref: string): string {
    return ref.split('/').pop() || '';
  }

  static getSchema(name: string): any {
    return this.schema[name];
  }

  static formatJson(jsonString: string, schema: any, targetPath: string = ''): string {
    try {
      if (!jsonString || !schema) {
        return jsonString;
      }
      const parsed = JSON5.parse(jsonString);
      const format = this.addComment(parsed, schema, targetPath);

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
          const schema = this.getSchema(this.getSchemaName(ref));
          result[field] = this.toSchemaObject(schema);
        });
      }
    }

    return result;
  }

  static toSchemaString(schema: any): string {
    if (!schema || !schema.properties) {
      return '{\n}';
    }
    const resultObject = this.toSchemaObject(schema);

    return this.addComment(resultObject, schema);
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
