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
