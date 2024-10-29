/**
 * 로그인
 */
export class ResLogin {
  /**
   * jwt token 정보
   */
  jwt?: JwtInfo;

  /**
   * 닉네임
   */
  nickname: string;
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
   * 만료시간(ms)
   */
  expires_in: number;
  /**
   * refresh token
   */
  refresh_token: string;
}

export class ResCreateUser {
  /**
   * 유저 닉네임
   */
  nickname: string;

  /**
   * 계정 만료 시간
   */
  expire_msec: number;
}

export class ResVerificationSend {
  /**
   * 리트라이 타임
   */
  retry_msec: number;
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
