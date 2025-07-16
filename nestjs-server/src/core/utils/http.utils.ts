import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import CoreError from '../error/core.error';

class HttpUtil {
  /**
   * GET 요청을 보냅니다.
   * @param url 요청할 URL
   * @param config 추가적인 axios 설정 (헤더, 파라미터 등)
   */
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await axios.get<T>(url, config);

      return response;
    } catch (error) {
      throw CoreError.EXTERNAL_REQUEST_ERROR(error.message);
    }
  }

  /**
   * POST 요청을 보냅니다.
   * @param url 요청할 URL
   * @param data 전송할 데이터
   * @param config 추가적인 axios 설정 (헤더 등)
   */
  static async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await axios.post<T>(url, data, config);

      return response;
    } catch (error) {
      throw CoreError.EXTERNAL_REQUEST_ERROR(error.message);
    }
  }

  /**
   * PUT 요청을 보냅니다.
   * @param url 요청할 URL
   * @param data 전송할 데이터
   * @param config 추가적인 axios 설정 (헤더 등)
   */
  static async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await axios.put<T>(url, data, config);

      return response;
    } catch (error) {
      throw CoreError.EXTERNAL_REQUEST_ERROR(error.message);
    }
  }

  /**
   * DELETE 요청을 보냅니다.
   * @param url 요청할 URL
   * @param config 추가적인 axios 설정 (헤더 등)
   */
  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await axios.delete<T>(url, config);

      return response;
    } catch (error) {
      throw CoreError.EXTERNAL_REQUEST_ERROR(error.message);
    }
  }
}

export default HttpUtil;
