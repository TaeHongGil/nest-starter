import ServerConfig from '@root/common/config/server.config';
import HttpUtil from '@root/common/util/http.util';
import MessageUtil from '@root/common/util/message.util';
import { ApiEndpoint, ApiEndpoints } from '@root/views/pages/management/store/api.endpoints';
import { AxiosInstance } from 'axios';
import { makeAutoObservable } from 'mobx';

export enum ROLE {
  GUEST = 0,
  USER = 1,
  ADMIN = 100,
}

export interface User {
  token: string;
  name: string;
  email: string;
  role: ROLE;
}

export interface PlatformInfo {
  google: {
    client_id: string;
  };
}

class ManagementStore {
  user: User | undefined;
  platformInfo: PlatformInfo | undefined;

  constructor() {
    makeAutoObservable(this);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        this.user = undefined;
      }
    }
  }

  setUser(user: User) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearUser() {
    this.user = undefined;
    localStorage.removeItem('user');
  }

  async sendRequest(apiEndpoint: ApiEndpoint, params?: any, headers?: any, toast = true) {
    const method = apiEndpoint.method;
    const path = apiEndpoint.path;

    headers = {
      ...headers,
      Authorization: `Bearer ${this.user?.token || ''}`,
    };

    try {
      const interceptors = async (instance: AxiosInstance, response: any) => {
        const originalRequest = response.config as any;

        if (response.data?.error?.message === 'invalid or expired refresh token' && !originalRequest?._retry) {
          originalRequest._retry = true;
          alert('세션 만료');

          return response;
        } else if (response.data?.error?.message === 'invalid or expired token' && !originalRequest?._retry) {
          originalRequest._retry = true;
          await this.refreshToken();
          originalRequest.headers['Authorization'] = `Bearer ${this.user?.token || ''}`;

          return instance.request(originalRequest);
        }

        return response;
      };

      const response = await HttpUtil.request<any>(ServerConfig.server_base_url, method, path, params, headers, interceptors);

      if (response.data?.data) {
        if (toast) {
          MessageUtil.success(`${path} Done`);
        }
      } else if (response.data?.error?.message) {
        MessageUtil.error(`${path}: ${response.data.error.message}`);
      }

      return response.data;
    } catch (error) {
      console.error(`Error in ${path}:`, error);

      return undefined;
    }
  }

  async refreshToken() {
    if (!this.user) {
      MessageUtil.error('로그인이 필요합니다.');

      return;
    }
    const response = await this.sendRequest(ApiEndpoints.REFRESH_TOKEN);
    this.user.token = response?.data?.jwt?.access_token;
    this.setUser(this.user);
  }

  async getPlatformInfo() {
    if (this.platformInfo) {
      return;
    }

    const response = await this.sendRequest(ApiEndpoints.PLATFORM_INFO);
    this.platformInfo = response?.platform;

    return this.platformInfo;
  }
}

const managementStore = new ManagementStore();
await managementStore.getPlatformInfo();
export default managementStore;
