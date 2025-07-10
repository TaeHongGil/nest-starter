import { CredentialResponse } from '@react-oauth/google';
import ServerConfig from '@root/common/config/server.config';
import { METHOD_TYPE } from '@root/common/define/common.define';
import HttpUtil from '@root/common/util/http.util';
import MessageUtil from '@root/common/util/message.util';
import axios from 'axios';
import { makeAutoObservable } from 'mobx';

export interface User {
  token: string;
  name: string;
  email: string;
  role: string;
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

  async googleLogin(credentialResponse: CredentialResponse) {
    if (this.user) {
      return;
    }

    const response = await HttpUtil.request<any>(ServerConfig.server_base_url, METHOD_TYPE.POST, `${ServerConfig.server_version}/account/platform/login`, {
      token: credentialResponse.credential,
      platform: 'GOOGLE',
    });

    const data = response.data.data;
    if (response.data) {
      this.setUser({
        email: data.platform_data?.email,
        token: data.jwt.access_token,
        name: data.platform_data?.name,
        role: data.role,
      });
    }

    return this.user;
  }

  async sendRequest(method: METHOD_TYPE, url: string, params?: any, headers?: any) {
    if (!this.user) {
      MessageUtil.error('로그인이 필요합니다.');

      return;
    }
    axios.interceptors.request.use((config) => {
      config.headers['Authorization'] = `Bearer ${this.user?.token}`;

      return config;
    });

    axios.interceptors.response.use(async (response) => {
      const originalRequest = response.config as any;
      if (response.data?.error?.message === 'invalid or expired refresh token' && !originalRequest._retry) {
        originalRequest._retry = true;
        this.clearUser();
        alert('세션 만료');

        return response;
      } else if (response.data?.error?.message === 'invalid or expired token' && !originalRequest._retry) {
        originalRequest._retry = true;
        await this.refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${this.user?.token}`;

        return axios(originalRequest);
      }

      return response;
    });

    const response = await HttpUtil.request<any>(ServerConfig.server_base_url, method, `${ServerConfig.server_version}/${url}`, params, headers);

    if (response.data?.data) {
      MessageUtil.success(`${url} Done`);
      console.log(`${url} Done`, response.data.data);
    } else if (response.data?.error?.message) {
      MessageUtil.error(`${url}: ${response.data.error.message}`);
    }

    return response.data;
  }

  async refreshToken() {
    if (!this.user) {
      MessageUtil.error('로그인이 필요합니다.');

      return;
    }
    const response = await HttpUtil.request<any>(ServerConfig.server_base_url, METHOD_TYPE.POST, `${ServerConfig.server_version}/auth/token`);
    if (response.data?.data) {
      this.user.token = response.data.data.jwt?.access_token;
    }

    return;
  }

  async getPlatformInfo() {
    if (this.platformInfo) {
      return;
    }

    const response = await HttpUtil.request<any>(ServerConfig.server_base_url, METHOD_TYPE.GET, `${ServerConfig.server_version}/info`);
    this.platformInfo = response.data?.platform;

    return this.platformInfo;
  }
}

const managementStore = new ManagementStore();
await managementStore.getPlatformInfo();
export default managementStore;
