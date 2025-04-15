import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';
import ServerConfig from '../config/server.config';
import { METHOD_TYPE } from '../define/common.define';

class HttpUtil {
  /**
   * Sends a request.
   * @param url The URL to request.
   * @param params Query or body parameters.
   * @param headers Request headers.
   */
  static async request<T>(method: METHOD_TYPE, url: string, params?: any, headers?: any): Promise<AxiosResponse<T>> {
    const config: AxiosRequestConfig = {
      baseURL: ServerConfig.url,
      url,
      method,
      headers,
    };

    if (method === 'GET') {
      config.params = params;
      config.paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'repeat' });
    } else {
      config.data = params;
    }

    config.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...config.headers,
    };

    const response = await axios.request<T>(config);
    return response;
  }

  /**
   * Previews the request URL.
   * @param url The URL to preview.
   * @param params Query parameters.
   * @returns The complete URL string.
   */
  static previewUrl(url: string, params?: Record<string, any>): string {
    const queryString = qs.stringify(params || {}, { arrayFormat: 'repeat' });
    return `${ServerConfig.url}${url}?${queryString}`;
  }
}

export default HttpUtil;
