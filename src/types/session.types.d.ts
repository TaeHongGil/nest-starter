import { Request, Response } from 'express';
import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    cookie: Cookie;
    user: SessionUser;
    request: Request;
    response: Response;
  }
}
