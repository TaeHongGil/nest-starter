export class CoreDefine {
  static readonly SERVICE_NAME = 'nest';
  static readonly ONE_HOUR_SEC = 60 * 60;
  static readonly ONE_HOUR_MSEC = this.ONE_HOUR_SEC * 1000;
  static readonly ONE_DAY_SEC = this.ONE_HOUR_SEC * 24;
  static readonly ONE_DAY_MSEC = this.ONE_DAY_SEC * 1000;
  static readonly ONE_WEEK_SEC = this.ONE_DAY_SEC * 7;
  static readonly ONE_WEEK_MSEC = this.ONE_WEEK_SEC * 1000;
  static readonly ONE_MINUTE_MSEC = 60 * 1000;
  static readonly ONE_MINUTE_SEC = 60;
  static readonly ONE_SEC_MSEC = 1000;
  static readonly ONE_DAY_MIN = 24 * 60;

  static readonly LOGIN_STATE_EXPIRE_SEC = this.ONE_MINUTE_SEC * 15;

  static readonly SERVER_TYPE = {
    TEST: 'test',
    LOCAL: 'local',
    DEV: 'dev',
    QA: 'qa',
    LIVE: 'live',
  };
}

export enum PLATFORM {
  SERVER = 'SERVER',
  GOOGLE = 'GOOGLE',
  NAVER = 'NAVER',
  KAKAO = 'KAKAO',
}
