import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';
import { METHOD_TYPE } from '../define/common.define';
import MessageUtil from './message.util';

class HttpUtil {
  /**
   * Sends a request.
   * @param url The URL to request.
   * @param params Query or body parameters.
   * @param headers Request headers.
   */
  static async request<T>(
    baseUrl: string,
    method: METHOD_TYPE,
    url: string,
    params?: any,
    headers?: any,
    responseInterceptors?: (axiosInstance: AxiosInstance, response: AxiosResponse<T>) => Promise<any>,
  ): Promise<AxiosResponse<T>> {
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

      if (responseInterceptors) {
        axiosInstance.interceptors.request.use(
          async (config) => {
            return config;
          },
          async (error) => {
            return Promise.reject(error);
          },
        );

        axiosInstance.interceptors.response.use(
          async (response) => {
            return await responseInterceptors(axiosInstance, response);
          },
          async (error) => {
            return Promise.reject(error);
          },
        );
      }

      const config: AxiosRequestConfig = {
        url,
        method,
      };

      if (method === 'GET') {
        config.params = params;
        config.paramsSerializer = (params): string => qs.stringify(params, { arrayFormat: 'repeat' });
      } else {
        config.data = params;
      }

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

  /**
   * Previews the request URL.
   * @param url The URL to preview.
   * @param params Query parameters.
   * @returns The complete URL string.
   */
  static previewUrl(baseurl: string, url: string, params?: Record<string, any>): string {
    const queryString = qs.stringify(params || {}, { arrayFormat: 'repeat' });

    return `${baseurl}${url}${queryString ? `?${queryString}` : ''}`;
  }
}

export default HttpUtil;
