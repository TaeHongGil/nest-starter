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
  EXPIRES_SEC = TIME_IN_SECONDS.ONE_MINUTE * 15,
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
  UNVERIFIED = 0,
  USER = 1,
  MANAGER = 10,
  ADMIN = 100,
}

export class BOARD_CONFIG {
  static readonly COMMENT_MAX_DEPTH = 4;
  static readonly COMMENT_MAX_PER_PAGE = 30;
  static readonly COMMENT_MAX_CONTENT = 200;
  static readonly POST_MAX_PER_PAGE = 20;
  static readonly POST_MAX_TITLE = 30;
  static readonly POST_MAX_CONTENT = 1000;
}

export enum CUSTOM_METADATA {
  NOT_VERIFIED = 'NOT_VERIFIED',
}
