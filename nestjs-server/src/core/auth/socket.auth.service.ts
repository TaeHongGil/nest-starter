import { Injectable } from '@nestjs/common';
import { AuthService } from '@root/core/auth/auth.service';
import ServerConfig from '@root/core/config/server.config';
import ServerError from '@root/core/error/server.error';
import CryptUtil from '@root/core/utils/crypt.utils';
import { JwtPayload } from 'jsonwebtoken';
import { Server } from 'socket.io';

type WsMiddleware = Parameters<Server['use']>[0];

@Injectable()
export class SocketAuthService {
  constructor(private readonly authService: AuthService) {}

  socketGuard(): WsMiddleware {
    return async (socket, next) => {
      try {
        const { Authorization } = socket.handshake.auth;
        const jwtInfo = CryptUtil.jwtVerify(this.authService.getToken(Authorization), ServerConfig.jwt.key) as JwtPayload;
        if (!jwtInfo) {
          throw ServerError.INVALID_TOKEN;
        }
        next();
      } catch (err) {
        next(err);
      }
    };
  }
}
