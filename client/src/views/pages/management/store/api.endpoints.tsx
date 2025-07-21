import { METHOD_TYPE } from '@root/common/define/common.define';

export interface ApiEndpoint {
  path: string;
  method: METHOD_TYPE;
}

export const ApiEndpoints = {
  REFRESH_TOKEN: { method: METHOD_TYPE.POST, path: 'auth/token' },
  PLATFORM_INFO: { method: METHOD_TYPE.GET, path: 'info' },
  GOOGLE_LOGIN: { method: METHOD_TYPE.POST, path: 'google/login' },
  LOGOUT: { method: METHOD_TYPE.POST, path: 'account/logout' },
  GET_JOBS: { method: METHOD_TYPE.GET, path: 'cron/jobs' },
  EXECUTE_JOBS: { method: METHOD_TYPE.POST, path: 'cron/execute' },
  UPDATE_JOB: { method: METHOD_TYPE.POST, path: 'cron/update' },
  GET_USERS: { method: METHOD_TYPE.GET, path: 'admin/users' },
  UPDATE_ROLE: { method: METHOD_TYPE.PUT, path: 'admin/update/role' },
  USER_UPDATE_ROLE: { method: METHOD_TYPE.PUT, path: 'user/update/role' },
  GET_SHEET_DATA: { method: METHOD_TYPE.GET, path: 'google/sheet/data' },
};

export type ApiKey = keyof typeof ApiEndpoints;
