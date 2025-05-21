import { Injectable } from '@nestjs/common';
import { AuthService } from '@root/core/auth/auth.service';
import ServerConfig from '@root/core/config/server.config';
import ServerError from '@root/core/error/server.error';
import CryptUtil from '@root/core/utils/crypt.utils';
import { JwtPayload } from 'jsonwebtoken';
import { Server } from 'socket.io';
import { CommonResponse } from '../common/response';

type WsMiddleware = Parameters<Server['use']>[0];

@Injectable()
export class WsAuthService {
  constructor(private readonly authService: AuthService) {}

  socketGuard(): WsMiddleware {
    return async (socket, next) => {
      try {
        const { Authorization } = socket.handshake.auth;
        const jwtInfo = CryptUtil.jwtVerify(this.authService.getToken(Authorization), ServerConfig.jwt.key) as JwtPayload;
        if (!jwtInfo) {
          const err = new Error('INVALID_TOKEN');
          (err as any).data = CommonResponse.builder().setError(ServerError.INVALID_TOKEN).build();

          return next(err);
        }
        next();
      } catch (err) {
        next(err);
      }
    };
  }
}
