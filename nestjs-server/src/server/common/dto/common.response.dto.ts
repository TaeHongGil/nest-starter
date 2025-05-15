import { ROLE } from '@root/core/define/define';

/**
 * 로그인
 */
export class ResLogin {
  /**
   * jwt token 정보
   */
  jwt: JwtInfo;

  /**
   * 닉네임
   */
  nickname: string;

  /**
   * 권한
   */
  role: ROLE;
}

export class ResTokenRefresh {
  jwt: JwtInfo;
}

/**
 * 토큰정보
 */
export class JwtInfo {
  /**
   * 엑세스 토큰
   */
  access_token: string;
  /**
   * 토큰타입
   */
  token_type: string;
  /**
   * 만료시간(sec)
   */
  access_expire_sec: number;
  /**
   * refresh token
   */
  refresh_token: string;
  /**
   * 만료시간(sec)
   */
  refresh_expire_sec: number;
}

export class ResCreateGuest {
  /**
   * 유저 닉네임
   */
  nickname: string;

  /**
   * UUID
   */
  uuid: string;
}

export class ResDuplicatedCheck {
  /**
   * 중복 여부 true: 중복 / false: 중복 X
   */
  result: boolean;
}

export class ResGetAccount {
  nickname: string;
}
