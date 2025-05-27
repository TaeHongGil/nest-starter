import { Request, Response } from 'express';
import { ROLE } from '../define/define';

export class SessionUser {
  useridx: number;
  nickname: string;
  role: ROLE;
}

export interface SessionData {
  user: SessionUser;
  request: Request;
  response: Response;
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
}
