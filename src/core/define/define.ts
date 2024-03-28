export class CoreDefine {
  static readonly ONE_HOUR_SECS = 60 * 60;
  static readonly ONE_HOUR_MILLIS = this.ONE_HOUR_SECS * 1000;
  static readonly ONE_DAY_SECS = this.ONE_HOUR_SECS * 24;
  static readonly ONE_DAY_MSECS = this.ONE_DAY_SECS * 1000;
  static readonly ONE_WEEK_SECS = this.ONE_DAY_SECS * 7;
  static readonly ONE_WEEK_MSECS = this.ONE_WEEK_SECS * 1000;
  static readonly ONE_MINUTE_MSECS = 60 * 1000;
  static readonly ONE_MINUTE_SECS = 60;
  static readonly ONE_SEC_MILLIS = 1000;
  static readonly ONE_DAY_MINUTES = 24 * 60;

  static readonly PLATFORM = {
    GOOGLE: 'GOOGLE',
  };

  static readonly SERVER_TYPE = {
    TEST: 'test',
    LOCAL: 'local',
    DEV: 'dev',
    QA: 'qa',
    LIVE: 'live',
  };
}
