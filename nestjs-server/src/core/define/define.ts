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

export enum SERVER_TYPE {
  TEST = 'test',
  LOCAL = 'local',
  DEV = 'dev',
  QA = 'qa',
  LIVE = 'live',
}

export enum PLATFORM {
  SERVER = 'SERVER',
  GOOGLE = 'GOOGLE',
  NAVER = 'NAVER',
  KAKAO = 'KAKAO',
}

export enum ROLE {
  USER = 'USER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
}

export const BULL_QUEUES = ['test'];
