import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import ServerConfig from '../config/server.config';
import { METHOD_TYPE } from '../define/common.define';

class HttpUtil {
  /**
   * GET 요청을 보냅니다.
   * @param url 요청할 URL
   * @param config 추가적인 axios 설정 (헤더, 파라미터 등)
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
}

export default HttpUtil;
