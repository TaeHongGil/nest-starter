/**
 * 컴포넌트 색상 타입
 */
export enum COLOR_TYPE {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  DANGER = 'danger',
  WARNING = 'warning',
  INFO = 'info',
  DARK = 'dark',
  LIGHT = 'light',
}

/**
 * 서비스 TYPE 종류
 */
export enum SERVER_TYPE {
  TEST = 'test',
  LOCAL = 'local',
  DEV = 'dev',
  QA = 'qa',
  STAGE = 'stage',
  REVIEW = 'review',
  LIVE = 'live',
}

/**
 * http method 타입
 */
export enum METHOD_TYPE {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
}
