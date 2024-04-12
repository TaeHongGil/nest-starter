import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    cookie: Cookie;
    user: SessionUser;
  }
}
