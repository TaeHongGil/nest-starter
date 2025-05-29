import { Injectable } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';
import ServerError from '@root/core/error/server.error';
import CryptUtil from '@root/core/utils/crypt.utils';
import { JwtPayload } from 'jsonwebtoken';
import { Server } from 'socket.io';
import { CommonResponse } from '../../../../core/common/response';
type WsMiddleware = Parameters<Server['use']>[0];

@Injectable()
export class WsAuthMiddleware {
  use(): WsMiddleware {
    return async (socket, next) => {
      try {
        const { Authorization } = socket.handshake.auth;
        const jwtInfo = CryptUtil.jwtVerify(CryptUtil.getToken(Authorization), ServerConfig.jwt.key) as JwtPayload;
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
