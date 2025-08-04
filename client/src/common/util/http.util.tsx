import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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
      const axiosInstance = axios.create({
        baseURL: baseUrl,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          ...headers,
        },
      });

      const config: AxiosRequestConfig = {
        url,
        method,
      };

      const response = await axiosInstance.request<T>(config);
      console.log(response);

      return response;
    } catch (error: any) {
      MessageUtil.error(`Failed to request(${url}). please try again. err=${error.message}`);
      throw error;
    } finally {
      MessageUtil.loadingProgress(false);
    }
  }
}

export default HttpUtil;
