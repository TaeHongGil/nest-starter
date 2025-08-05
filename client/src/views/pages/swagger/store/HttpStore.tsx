import { METHOD_TYPE } from '@root/common/define/common.define';
import CommonUtil from '@root/common/util/common.util';
import MessageUtil from '@root/common/util/message.util';
import StorageUtil from '@root/common/util/storage.util';
import dayjs from 'dayjs';
import JSON5 from 'json5';
import { makeAutoObservable, runInAction } from 'mobx';
import { protocolStore } from './ProtocolStore';
import SwaggerMetadata, { DefaultSchema, PathInfo } from './SwaggerMetadata';
import qs from 'qs';
import ServerApi from '@root/common/util/server.api';

export type HttpHistoryMap = Record<string, HttpHistoryEntry[]>;

export type HttpApiMap = Record<string, HttpApiData>;

export interface HttpApiData {
  request: {
    params: HttpRequestParams;
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

export interface HttpRequestParams {
  path: Record<string, number | string>;
  query: Record<string, any>;
}

export class HttpStore {
  apiMap: HttpApiMap = {};
  historyMap: HttpHistoryMap = {};
  requestBody: string = '';
  requestParams: HttpRequestParams = { path: {}, query: {} };
  pathInfo: PathInfo = { method: METHOD_TYPE.GET, path: '' };
  refreshTrigger = 0;

  constructor() {
    makeAutoObservable(this);
  }

  async initialize(): Promise<void> {
    const apiMap = await StorageUtil.loadIndexDB<HttpApiMap>('http', 'api', {});
    const historyMap = await StorageUtil.loadIndexDB<HttpHistoryMap>('http', 'history', {});
    const pathInfo = await StorageUtil.loadIndexDB<PathInfo>('http', 'path', { method: METHOD_TYPE.GET, path: '/' });
    runInAction(() => {
      this.apiMap = apiMap;
      this.historyMap = historyMap;
      this.pathInfo = pathInfo;
    });
    const data = this.getCurrentApi();
    this.setRequestBody(data.request.body);
    this.setRequestParams(data.request.params);
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
    const name = ref.length > 0 ? SwaggerMetadata.getSchemaName(ref[ref.length - 1]) : '';
    const schema = name ? SwaggerMetadata.getSchema(name) : undefined;

    return { name, schema };
  }

  getCurrentApi(): HttpApiData {
    return (
      this.apiMap[this.getApiKey()] ?? {
        request: { body: SwaggerMetadata.toSchemaString(this.getRequestSchema()?.schema), params: { path: {}, query: {} } },
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

  setRequestParams(params: HttpRequestParams): void {
    runInAction(() => {
      this.requestParams = params;
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
    this.setRequestParams(data.request.params);
    await StorageUtil.saveIndexDB('http', 'path', path);
  }

  async resetRequest(): Promise<void> {
    delete this.apiMap[this.getApiKey()];
    const data = this.getCurrentApi();
    this.setRequestBody(data.request.body);
    this.setRequestParams(data.request.params);
    await StorageUtil.saveIndexDB('http', 'api', this.apiMap);
  }

  private toApiMethodName(str: string) {
    if (!str) return '';
    const [controller, method] = str.split('_');
    if (!controller || !method) return str;

    return controller.charAt(0).toLowerCase() + controller.slice(1) + method.charAt(0).toUpperCase() + method.slice(1);
  }

  async sendRequest(): Promise<void> {
    if (!this.pathInfo || !this.requestBody) {
      MessageUtil.error('Path and body are required to send a request.');

      return;
    }
    const info = SwaggerMetadata.getPath(this.pathInfo.method, this.pathInfo.path);
    const id = this.toApiMethodName(info?.operationId);

    const method = this.pathInfo.method;
    const path = this.pathInfo.path;
    let requestBody;
    try {
      requestBody = JSON5.parse(this.requestBody);
    } catch (error: any) {
      MessageUtil.error(`Invalid JSON format: ${error.message}`);

      return;
    }
    try {
      const category = info.tags[0] as keyof typeof ServerApi;
      const apiCategory = ServerApi[category] as Record<string, any>;
      if (!apiCategory) {
        MessageUtil.error(`API category ${category} not found.`);

        return;
      }
      ServerApi.headers = protocolStore.globalHeader;
      const params = info.parameters.map((param: any) => {
        if (param.in == 'path') {
          return this.requestParams.path[param.name];
        } else if (param.in == 'query') {
          return this.requestParams.query[param.name];
        }

        return undefined;
      });

      if (info.requestBody) {
        params.push(requestBody);
      }
      const result = await apiCategory?.[id]?.(...params);
      if (!result) {
        MessageUtil.error(`API method ${id} not found in category ${category}.`);

        return;
      }

      const data: HttpApiData = {
        request: { body: SwaggerMetadata.formatJson(this.requestBody, this.getRequestSchema()?.schema), params: this.requestParams },
        response: { headers: JSON.stringify(result.headers, null, 2), body: JSON.stringify(result.data, null, 2) },
      };
      this.setRequestBody(data.request.body);
      await this.addHistory(data);
      await this.setApiData(data);
      await protocolStore.setAuthHeader(path, result.data);
      await protocolStore.setGlobalHeader();
    } catch (error: any) {
      MessageUtil.error(`Request failed: ${error.message}`);
    }
  }

  previewUrl(): string {
    const baseurl = SwaggerMetadata.servers[protocolStore.activeServer].api;
    let url = this.pathInfo.path;
    Object.keys(this.requestParams.path).forEach((key) => {
      url = url.replace(`{${key}}`, encodeURIComponent(String(this.requestParams.path[key])));
    });
    const queryString = qs.stringify(this.requestParams.query || {}, { arrayFormat: 'repeat' });

    return `${baseurl}${url}${queryString ? `?${queryString}` : ''}`;
  }
}
