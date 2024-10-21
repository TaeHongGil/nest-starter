import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ServerLogger } from '../server-log/server.log.service';

export class HttpUtil {
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
      this.handleError(error);
      throw error;
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
      this.handleError(error);
      throw error;
    }
  }

  /**
   * PUT 요청을 보냅니다.
   * @param url 요청할 URL
   * @param data 수정할 데이터
   * @param config 추가적인 axios 설정 (헤더 등)
   */
  static async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      const response = await axios.put<T>(url, data, config);

      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
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
      this.handleError(error);
      throw error;
    }
  }

  /**
   * 에러 처리 메서드
   * @param error 에러 객체
   */
  private static handleError(error: any): void {
    if (error.response) {
      ServerLogger.error('Response error:', error.response.data);
      ServerLogger.error('Status code:', error.response.status);
      ServerLogger.error('Headers:', error.response.headers);
    } else if (error.request) {
      ServerLogger.error('No response received:', error.request);
    } else {
      ServerLogger.error('Error in request setup:', error.message);
    }
  }
}
