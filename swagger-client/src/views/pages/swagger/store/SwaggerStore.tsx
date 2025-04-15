import ServerConfig from '@root/common/config/server.config';
import { METHOD_TYPE } from '@root/common/define/common.define';
import HttpUtil from '@root/common/util/http.util';
import NGSMessage from '@root/common/util/message.util';
import dayjs from 'dayjs';
import JSON5 from 'json5';
import localForage from 'localforage';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import SwaggerMetadata, { PathData } from './SwaggerMetadata';

type SwaggerHistory = Record<string, SwaggerHistoryData[]>;
type SwaggerCurrentApi = Record<string, SwaggerData>;
type SwaggerGlobalHeader = Record<string, string>;

interface SwaggerData {
  request: {
    query: Record<string, any>;
    body: string;
  };
  response: {
    headers: string;
    body: string;
  };
}

interface SwaggerHistoryData {
  date: string;
  data: SwaggerData;
}

export class SwaggerStore {
  metadata?: SwaggerMetadata;
  currentApi: SwaggerCurrentApi;
  history: SwaggerHistory;
  globalHeader: SwaggerGlobalHeader;
  requestBody: string;
  requestQuery: Record<string, any>;
  pathData: PathData;
  activeGameUrl: string;
  gameUrls: string[];

  refreshTrigger = 0;

  constructor() {
    makeAutoObservable(this, {
      metadata: false,
    });

    this.currentApi = {};
    this.history = {};
    this.globalHeader = {};
    this.gameUrls = [];
    this.activeGameUrl = '';
    this.requestBody = '';
    this.requestQuery = {};
    this.pathData = { method: METHOD_TYPE.GET, path: '' };
  }

  async init(metadata?: any) {
    const currentApi = await this.loadLocalStorage<SwaggerCurrentApi>('api', {});
    const history = await this.loadLocalStorage<SwaggerHistory>('history', {});
    const globalHeader = await this.loadLocalStorage<SwaggerGlobalHeader>('global_header', {
      Authorization: '',
      Version: '0.1.0',
      BundleVersion: '0.1.0',
      Platform: '2',
      seqid: '0',
      seqcount: '0',
    });
    const gameUrls = await this.loadLocalStorage<string[]>('game_urls', [ServerConfig.url]);
    const activeGameUrl = await this.loadLocalStorage<string>('active_game_url', gameUrls[0]);
    const path = await this.loadLocalStorage<PathData>('path', { method: METHOD_TYPE.GET, path: '' });
    runInAction(() => {
      if (metadata) {
        this.metadata = new SwaggerMetadata(metadata);
      }
      this.currentApi = currentApi;
      this.history = history;
      this.globalHeader = globalHeader;
      this.gameUrls = gameUrls;
      this.activeGameUrl = activeGameUrl;
      this.pathData = path;
    });
    const data = this.getCurrentData();
    this.updateRequestBody(data.request.body);
    this.updateRequestQuery(data.request.query);
    this.refresh();
  }

  async resetLocalStorage(): Promise<void> {
    const instance = localForage.createInstance({ name: 'swagger', storeName: ServerConfig.server_type, driver: localForage.INDEXEDDB });
    await instance.clear();
    await this.init();
  }

  async saveLocalStorage(key: string, value: any, storage?: LocalForage): Promise<void> {
    try {
      if (!value) {
        return;
      }
      const serializableValue = JSON.parse(JSON.stringify(toJS(value)));
      const instance = storage ?? localForage.createInstance({ name: 'swagger', storeName: ServerConfig.server_type, driver: localForage.INDEXEDDB });
      await instance.setItem(key, serializableValue);
    } catch (error) {
      console.error(`Failed to save "${key}" to local storage:`, error);
    }
  }

  async loadLocalStorage<T>(key: string, defaultValue: T, storage?: LocalForage): Promise<T> {
    const instance = storage ?? localForage.createInstance({ name: 'swagger', storeName: ServerConfig.server_type, driver: localForage.INDEXEDDB });
    const data = await instance.getItem<T>(key);
    return data !== null ? data : defaultValue;
  }

  refresh() {
    runInAction(() => {
      this.refreshTrigger++;
    });
  }

  async sendRequest(): Promise<void> {
    if (!this.pathData || !this.requestBody) {
      NGSMessage.error('Path and body are required to send a request.');
      return;
    }
    const method = this.pathData.method;
    const path = this.pathData.path;
    let params;
    try {
      params = method == METHOD_TYPE.GET ? this.requestQuery : JSON5.parse(this.requestBody);
    } catch (error: any) {
      NGSMessage.error(`Invalid JSON format: ${error.message}`);
      return;
    }

    try {
      const result = await HttpUtil.request(method, path, params, this.globalHeader);
      console.log(result);

      const data: SwaggerData = {
        request: { body: this.formatRequestBody(), query: this.requestQuery },
        response: { headers: JSON.stringify(result.headers, null, 4), body: JSON.stringify(result.data, null, 4) },
      };
      await this.setAuthorization(result.data);
      await this.updateHistory(data);
      await this.updateCurrentApiData(data);
    } catch (error: any) {
      NGSMessage.error(`Request failed: ${error.message}`);
    }
  }

  formatRequestBody(): string {
    try {
      const parsed = JSON5.parse(this.requestBody);
      const formattedLines = this.addComment(parsed, this.getCurrentSchmea());
      this.updateRequestBody(formattedLines);
      return formattedLines;
    } catch (e: any) {
      NGSMessage.error('Failed to format JSON.');
      console.error(e);
      return this.requestBody;
    }
  }

  getApiKey() {
    return `${this.pathData.method}_${this.pathData.path}`;
  }

  async resetRequest(): Promise<void> {
    delete this.currentApi[this.getApiKey()];
    const data = this.getCurrentData();
    this.updateRequestBody(data.request.body);
    this.updateRequestQuery(data.request.query);
    await this.saveLocalStorage('api', this.currentApi);
  }

  async loadMetadataAsync(): Promise<any> {
    try {
      const result = await HttpUtil.request(METHOD_TYPE.GET, `${ServerConfig.server_version}/swagger`);
      return result.data;
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  }

  toSchemaObject(schema: any): Record<string, any> {
    const result: Record<string, any> = {};
    for (const field in schema.properties) {
      const data = schema.properties[field];
      if (data.default != undefined) result[field] = data.default;
      else if (data.type == 'array') result[field] = [];
      else if (data.type == 'boolean') result[field] = false;
      else if (data.type == 'number') result[field] = 0;
      else if (data.type == 'string') result[field] = '';
      else if (data.type == 'date-time') result[field] = new Date().toISOString();
      else if (data.$ref) {
        data.schema = this.metadata?.getSchema(this.metadata?.getSchemaName(data.$ref));
        result[field] = this.toSchemaObject(data.schema);
      } else if (data.type == 'object') result[field] = {};
    }
    return result;
  }

  toSchemaString(schema: any): string {
    if (!schema || !schema.properties) {
      return '{}';
    }
    const resultObject = this.toSchemaObject(schema);
    return this.addComment(resultObject, schema);
  }

  addComment(object: any, schema: any): string {
    const required = schema?.required ?? [];
    const properties = schema?.properties ?? {};
    const lines: string[] = [];

    const formatValue = (value: any, data: any): string => {
      if (data?.schema && typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return this.addComment(value, data.schema).replace(/\n/g, '\n    ');
      }
      return JSON.stringify(value, null, 4).replace(/\n/g, '\n    ');
    };

    lines.push('{');
    Object.entries(object).forEach(([key, value]) => {
      const data = properties[key];
      const jsonValue = formatValue(value, data);
      const isOptional = required.includes(key) ? '' : ' (Optional)';
      const comment = data?.description ? `//${isOptional} ${data.description}` : '';
      lines.push(`    "${key}": ${jsonValue},  ${comment}`);
    });
    lines.push('}');

    return lines.join('\n');
  }

  getCurrentSchmea() {
    return this.metadata?.getDefaultSchema(this.pathData.method, this.pathData.path);
  }

  getCurrentPathInfo() {
    return this.metadata?.getPath(this.pathData.method, this.pathData.path);
  }

  getCurrentData(): SwaggerData {
    const data: SwaggerData = this.currentApi[this.getApiKey()] ?? {
      request: { body: this.toSchemaString(this.getCurrentSchmea()), query: {} },
      response: { headers: '', body: '' },
    };
    return data;
  }

  getSchemaString(): string {
    const schema = this.getCurrentPathInfo();
    if (!schema || !schema.defaultSchema) {
      return 'not found data';
    }
    const entries = [
      [schema.defaultSchema.name, schema.defaultSchema.schema.properties],
      ...Object.entries(this.metadata?.getChildSchema(this.pathData.method, this.pathData.path) ?? {}).map(([name, data]) => [name, data]),
    ];
    const result = entries.map(([name, properties]) => `class ${name} ${JSON5.stringify(properties, { quote: '"', space: 4 })}`);
    return result.join('\n');
  }

  getHistory(): SwaggerHistoryData[] {
    return this.history[this.getApiKey()] ?? [];
  }

  updateRequestBody(body: string) {
    runInAction(() => {
      this.requestBody = body;
    });
  }

  updateRequestQuery(params: Record<string, any>) {
    runInAction(() => {
      this.requestQuery = params;
    });
  }

  async updateGameUrl(url: string) {
    runInAction(() => {
      this.activeGameUrl = url;
    });
    await this.saveLocalStorage('active_game_url', this.activeGameUrl);
  }

  async updateHistory(data: SwaggerData): Promise<void> {
    if (!this.history[this.getApiKey()]) {
      this.history[this.getApiKey()] = [];
    }
    if (this.history[this.getApiKey()].length > 10) {
      this.history[this.getApiKey()].pop();
    }

    this.history[this.getApiKey()].unshift({
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data,
    });
    await this.saveLocalStorage('history', this.history);
  }

  async updateCurrentApiData(data: SwaggerData): Promise<void> {
    this.currentApi[this.getApiKey()] = data;
    await this.saveLocalStorage('api', this.currentApi);
  }

  async updatePath(path: PathData): Promise<void> {
    runInAction(() => {
      this.pathData = path;
    });
    const data = this.getCurrentData();
    this.updateRequestBody(data.request.body);
    this.updateRequestQuery(data.request.query);
    await this.saveLocalStorage('path', path);
  }

  async updateGlobalHeader(header: SwaggerGlobalHeader): Promise<void> {
    runInAction(() => {
      this.globalHeader = header;
    });
    await this.saveLocalStorage('global_header', this.globalHeader);
  }

  async setAuthorization(data: any) {
    if (!data?.content?.login_result?.token) {
      return;
    }
    runInAction(() => {
      this.globalHeader.Authorization = `Bearer ${data?.content?.login_result?.token}`;
    });
    await this.updateGlobalHeader(this.globalHeader);
  }
}
