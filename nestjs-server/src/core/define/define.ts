export enum TIME_IN_SECONDS {
  ONE_SECOND = 1,
  ONE_MINUTE = 60,
  ONE_HOUR = 60 * 60,
  ONE_DAY = 60 * 60 * 24,
  ONE_WEEK = 60 * 60 * 24 * 7,
}

export enum TIME_IN_MILLISECONDS {
  ONE_SECOND = 1000,
  ONE_MINUTE = 60 * 1000,
  ONE_HOUR = TIME_IN_SECONDS.ONE_HOUR * 1000,
  ONE_DAY = TIME_IN_SECONDS.ONE_DAY * 1000,
  ONE_WEEK = TIME_IN_SECONDS.ONE_WEEK * 1000,
}

export enum TIME_IN_MINUTES {
  ONE_HOUR = 60,
  ONE_DAY = 24 * 60,
}

export enum LOGIN_STATE {
  EXPIRES_SEC = TIME_IN_SECONDS.ONE_MINUTE * 10,
}

export enum ZONE_TYPE {
  TEST = 'test',
  LOCAL = 'local',
  DEV = 'dev',
  LIVE = 'live',
}

export enum SERVER_TYPE {
  NONE = 'none',
  API = 'api',
  SOCKET = 'socket',
  MQ = 'mq',
}

export enum PLATFORM {
  SERVER = 'SERVER',
  GOOGLE = 'GOOGLE',
}

export enum ROLE {
  ADMIN = 100,
  USER = 1,
  GUEST = 0,
}

export const LOG_COLOR_MAP = {
  error: 31, // 빨강
  warn: 33, // 노랑
  info: 32, // 초록
  http: 35, // 보라
  data: 36, // 파랑
  verbose: 36, // 청록
  debug: 36, // 청록
  silly: 90, // 회색
};
