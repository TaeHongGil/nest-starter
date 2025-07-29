import ServerConfig from '@root/common/config/server.config';
import MessageUtil from '@root/common/util/message.util';
import managementStore from '@root/views/pages/management/store/ManagementStore';
import axios from 'axios';
import { AccountApi, AdminApi, AppApi, AuthApi, Configuration, CronApi, GoogleApi, SlackApi, UserApi } from 'nestjs-api-axios';

export default class ServerApi {
  static configuration: Configuration;
  static app: AppApi;
  static account: AccountApi;
  static admin: AdminApi;
  static auth: AuthApi;
  static cron: CronApi;
  static google: GoogleApi;
  static slack: SlackApi;
  static user: UserApi;

  constructor() {
    ServerApi.configuration = new Configuration();
    ServerApi.configuration.baseOptions = {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    };
    const basePath = ServerConfig.server_base_url;

    const requestInterceptor = async (config: any) => {
      config.headers['Authorization'] = `Bearer ${managementStore.user?.token}`;

      return config;
    };

    const responseInterceptor = async (response: any) => {
      const originalRequest = response.config as any;

      if (response.data?.error?.message === 'invalid or expired refresh token' && !originalRequest?._retry) {
        originalRequest._retry = true;
        alert('세션 만료');

        return response;
      } else if (response.data?.error?.message === 'invalid or expired token' && !originalRequest?._retry) {
        originalRequest._retry = true;
        const response = await ServerApi.auth.authControllerTokenRefresh();
        const user = managementStore.user;
        if (user && response.data.data?.jwt?.access_token) {
          user.token = response.data.data?.jwt?.access_token ?? '';
          managementStore.setUser(user);
        } else {
          managementStore.clearUser();
        }

        return axios.request(originalRequest);
      }

      if (response.data?.data) {
        MessageUtil.success(`${new URL(response.config.url).pathname} Done`);
      } else if (response.data?.error) {
        MessageUtil.error(response.data.error.message ?? 'API 요청이 실패했습니다.');
      }

      return response;
    };

    axios.interceptors.request.clear();
    axios.interceptors.response.clear();
    axios?.interceptors.request.use(requestInterceptor);
    axios?.interceptors.response.use(responseInterceptor);

    ServerApi.app = new AppApi(ServerApi.configuration, basePath, axios);
    ServerApi.account = new AccountApi(ServerApi.configuration, basePath, axios);
    ServerApi.admin = new AdminApi(ServerApi.configuration, basePath, axios);
    ServerApi.auth = new AuthApi(ServerApi.configuration, basePath, axios);
    ServerApi.cron = new CronApi(ServerApi.configuration, basePath, axios);
    ServerApi.google = new GoogleApi(ServerApi.configuration, basePath, axios);
    ServerApi.slack = new SlackApi(ServerApi.configuration, basePath, axios);
    ServerApi.user = new UserApi(ServerApi.configuration, basePath, axios);
  }
}
new ServerApi();
