import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';
import ServerConfig from '../config/server.config';
import { METHOD_TYPE } from '../define/common.define';
import MessageUtil from './message.util';

class HttpUtil {
  /**
   * Sends a request.
   * @param url The URL to request.
   * @param params Query or body parameters.
   * @param headers Request headers.
   */
  static async request<T>(baseUrl: string, method: METHOD_TYPE, url: string, params?: any, headers?: any): Promise<AxiosResponse<T>> {
    MessageUtil.loadingProgress(true);
    try {
      const config: AxiosRequestConfig = {
        baseURL: baseUrl,
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
      MessageUtil.success(`${url} Done`);
      return response;
    } catch (error: any) {
      MessageUtil.error(`Failed to request(${url}). please try again. err=${error.message}`);
      throw error;
    } finally {
      MessageUtil.loadingProgress(false);
    }
  }

  /**
   * Previews the request URL.
   * @param url The URL to preview.
   * @param params Query parameters.
   * @returns The complete URL string.
   */
  static previewUrl(url: string, params?: Record<string, any>): string {
    const queryString = qs.stringify(params || {}, { arrayFormat: 'repeat' });
    return `${ServerConfig.url}${url}${queryString ? `?${queryString}` : ''}`;
  }
}

export default HttpUtil;
