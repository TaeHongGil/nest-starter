import ServerConfig from '@root/common/config/server.config';
import { METHOD_TYPE } from '@root/common/define/common.define';
import HttpUtil from '@root/common/util/http.util';
import MessageUtil from '@root/common/util/message.util';
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
  currentApi: SwaggerCurrentApi;
  history: SwaggerHistory;
  globalHeader: SwaggerGlobalHeader;
  requestBody: string;
  requestQuery: Record<string, any>;
  pathData: PathData;
  activeServer: string;

  refreshTrigger = 0;

  constructor() {
    makeAutoObservable(this);

    this.currentApi = {};
    this.history = {};
    this.globalHeader = {};
    this.activeServer = '';
    this.requestBody = '';
    this.requestQuery = {};
    this.pathData = { method: METHOD_TYPE.GET, path: '' };
  }

  async init() {
    const currentApi = await this.loadLocalStorage<SwaggerCurrentApi>('api', {});
    const history = await this.loadLocalStorage<SwaggerHistory>('history', {});
    const globalHeader = await this.loadLocalStorage<SwaggerGlobalHeader>('global_header', SwaggerMetadata.config.header ?? {});
    const activeServer = await this.loadLocalStorage<string>('active_server', Object.keys(SwaggerMetadata.servers ?? {}).find((key) => SwaggerMetadata.servers[key]) ?? 'local');
    const path = await this.loadLocalStorage<PathData>('path', { method: METHOD_TYPE.GET, path: `/${SwaggerMetadata.config.version}` });

    runInAction(() => {
      this.currentApi = currentApi;
      this.history = history;
      this.globalHeader = globalHeader;
      this.activeServer = activeServer;
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
      MessageUtil.error('Path and body are required to send a request.');
      return;
    }
    const method = this.pathData.method;
    const path = this.pathData.path;
    let params;
    try {
      params = method == METHOD_TYPE.GET ? this.requestQuery : JSON5.parse(this.requestBody);
    } catch (error: any) {
      MessageUtil.error(`Invalid JSON format: ${error.message}`);
      return;
    }

    try {
      const baseUrl = SwaggerMetadata.servers[this.activeServer] ?? 'local';
      const result = await HttpUtil.request(baseUrl, method, path, params, this.globalHeader);
      console.log(result);

      const data: SwaggerData = {
        request: { body: SwaggerMetadata.formatJson(this.requestBody, this.getCurrentSchmea()?.schema), query: this.requestQuery },
        response: { headers: JSON.stringify(result.headers, null, 2), body: JSON.stringify(result.data, null, 2) },
      };
      this.updateRequestBody(data.request.body);
      await this.setAuthorization(path, result.data);
      await this.updateHistory(data);
      await this.updateCurrentApiData(data);
    } catch (error: any) {
      MessageUtil.error(`Request failed: ${error.message}`);
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
      const result = await HttpUtil.request(ServerConfig.url, METHOD_TYPE.GET, `${ServerConfig.server_version}/swagger`);
      return result.data;
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  }

  getCurrentSchmea() {
    return SwaggerMetadata.getDefaultSchema(this.pathData.method, this.pathData.path);
  }

  getCurrentPathInfo() {
    return SwaggerMetadata.getPath(this.pathData.method, this.pathData.path);
  }

  getCurrentData(): SwaggerData {
    const data: SwaggerData = this.currentApi[this.getApiKey()] ?? {
      request: { body: SwaggerMetadata.toSchemaString(this.getCurrentSchmea()?.schema), query: {} },
      response: { headers: '', body: '' },
    };
    return data;
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

  async updateActiveServer(server: string) {
    runInAction(() => {
      this.activeServer = server;
    });
    await this.saveLocalStorage('active_server', this.activeServer);
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

  async setAuthorization(path: string, data: any) {
    if (!SwaggerMetadata.config?.token) {
      return;
    }

    const tokenPath = SwaggerMetadata.config.token[path];
    if (tokenPath) {
      const token = tokenPath.split('.').reduce((obj, key) => obj?.[key], data);
      if (token) {
        runInAction(() => {
          this.globalHeader.Authorization = `Bearer ${token}`;
        });
        await this.updateGlobalHeader(this.globalHeader);
      }
    }
  }
}
