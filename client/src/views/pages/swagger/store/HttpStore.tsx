import { METHOD_TYPE } from '@root/common/define/common.define';
import CommonUtil from '@root/common/util/common.util';
import HttpUtil from '@root/common/util/http.util';
import MessageUtil from '@root/common/util/message.util';
import StorageUtil from '@root/common/util/storage.util';
import dayjs from 'dayjs';
import JSON5 from 'json5';
import { makeAutoObservable, runInAction } from 'mobx';
import { protocolStore } from './ProtocolStore';
import SwaggerMetadata, { DefaultSchema, PathInfo } from './SwaggerMetadata';

export type HttpHistoryMap = Record<string, HttpHistoryEntry[]>;

export type HttpApiMap = Record<string, HttpApiData>;

export interface HttpApiData {
  request: {
    query: Record<string, any>;
    body: string;
  };
  response: {
    headers: string;
    body: string;
  };
}

export interface HttpHistoryEntry {
  date: string;
  data: HttpApiData;
}

export class HttpStore {
  apiMap: HttpApiMap = {};
  historyMap: HttpHistoryMap = {};
  requestBody: string = '';
  requestQuery: Record<string, any> = {};
  pathInfo: PathInfo = { method: METHOD_TYPE.GET, path: '' };
  refreshTrigger = 0;

  constructor() {
    makeAutoObservable(this);
  }

  async initialize(): Promise<void> {
    const apiMap = await StorageUtil.loadIndexDB<HttpApiMap>('http', 'api', {});
    const historyMap = await StorageUtil.loadIndexDB<HttpHistoryMap>('http', 'history', {});
    const pathInfo = await StorageUtil.loadIndexDB<PathInfo>('http', 'path', { method: METHOD_TYPE.GET, path: `/${SwaggerMetadata.config.version}` });
    runInAction(() => {
      this.apiMap = apiMap;
      this.historyMap = historyMap;
      this.pathInfo = pathInfo;
    });
    const data = this.getCurrentApi();
    this.setRequestBody(data.request.body);
    this.setRequestQuery(data.request.query);
    this.triggerRefresh();
  }

  triggerRefresh(): void {
    this.refreshTrigger++;
  }

  getApiKey(): string {
    return `${this.pathInfo.method}_${this.pathInfo.path}`;
  }

  getRequestSchema(): DefaultSchema {
    return SwaggerMetadata.getPath(this.pathInfo.method, this.pathInfo.path)?.defaultSchema;
  }

  getResponseSchema(): DefaultSchema {
    const pathInfo = SwaggerMetadata.getPath(this.pathInfo.method, this.pathInfo.path);
    if (!pathInfo) return { name: '', schema: undefined };
    const ref = CommonUtil.findAllValuesByKey(pathInfo.responses, '$ref');
    const name = ref.length > 0 ? SwaggerMetadata.getSchemaName(ref[0]) : '';
    const schema = name ? SwaggerMetadata.getSchema(name) : undefined;

    return { name, schema };
  }

  getCurrentApi(): HttpApiData {
    return (
      this.apiMap[this.getApiKey()] ?? {
        request: { body: SwaggerMetadata.toSchemaString(this.getRequestSchema()?.schema), query: {} },
        response: { headers: '', body: '' },
      }
    );
  }

  getHistorys(): HttpHistoryEntry[] {
    return this.historyMap[this.getApiKey()] ?? [];
  }

  setRequestBody(body: string): void {
    runInAction(() => {
      this.requestBody = body;
    });
  }

  setRequestQuery(params: Record<string, any>): void {
    runInAction(() => {
      this.requestQuery = params;
    });
  }

  async addHistory(data: HttpApiData): Promise<void> {
    runInAction(() => {
      if (!this.historyMap[this.getApiKey()]) {
        this.historyMap[this.getApiKey()] = [];
      }
      if (this.historyMap[this.getApiKey()].length > 10) {
        this.historyMap[this.getApiKey()].pop();
      }
      this.historyMap[this.getApiKey()].unshift({
        date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        data,
      });
    });
    await StorageUtil.saveIndexDB('http', 'history', this.historyMap);
  }

  async setApiData(data: HttpApiData): Promise<void> {
    runInAction(() => {
      this.apiMap[this.getApiKey()] = data;
    });
    await StorageUtil.saveIndexDB('http', 'api', this.apiMap);
  }

  async setPathInfo(path: PathInfo): Promise<void> {
    runInAction(() => {
      this.pathInfo = path;
    });
    const data = this.getCurrentApi();
    this.setRequestBody(data.request.body);
    this.setRequestQuery(data.request.query);
    await StorageUtil.saveIndexDB('http', 'path', path);
  }

  async resetRequest(): Promise<void> {
    delete this.apiMap[this.getApiKey()];
    const data = this.getCurrentApi();
    this.setRequestBody(data.request.body);
    this.setRequestQuery(data.request.query);
    await StorageUtil.saveIndexDB('http', 'api', this.apiMap);
  }

  async sendRequest(): Promise<void> {
    if (!this.pathInfo || !this.requestBody) {
      MessageUtil.error('Path and body are required to send a request.');

      return;
    }
    const method = this.pathInfo.method;
    const path = this.pathInfo.path;
    let params;
    try {
      params = method === METHOD_TYPE.GET ? this.requestQuery : JSON5.parse(this.requestBody);
    } catch (error: any) {
      MessageUtil.error(`Invalid JSON format: ${error.message}`);

      return;
    }
    try {
      const baseUrl = SwaggerMetadata.servers[protocolStore.activeServer].api ?? '';
      const result = await HttpUtil.request(baseUrl, method, path, params, protocolStore.globalHeader);
      const data: HttpApiData = {
        request: { body: SwaggerMetadata.formatJson(this.requestBody, this.getRequestSchema()?.schema), query: this.requestQuery },
        response: { headers: JSON.stringify(result.headers, null, 2), body: JSON.stringify(result.data, null, 2) },
      };
      MessageUtil.success(`${path} Done`);
      this.setRequestBody(data.request.body);
      await this.addHistory(data);
      await this.setApiData(data);
      await protocolStore.setAuthHeader(path, result.data);
      await protocolStore.setGlobalHeader();
    } catch (error: any) {
      MessageUtil.error(`Request failed: ${error.message}`);
    }
  }
}
