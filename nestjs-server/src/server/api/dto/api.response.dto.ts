import { JwtInfo } from '@root/core/auth/auth.schema';
import { ROLE } from '@root/core/define/core.define';

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

  /**
   * 플랫폼 프로필 데이터
   */
  profile?: any;
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

export class ResUser {
  useridx: number;
  nickname: string;
  role: ROLE;
  created_at: string;
}

export class ResGetUsers {
  users: ResUser[];
}

export class ResGetSheetData {
  /**
   * data 조회 결과
   */
  result: string[][];
}
