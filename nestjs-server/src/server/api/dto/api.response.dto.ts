import { JwtInfo } from '@root/core/auth/auth.schema';
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
