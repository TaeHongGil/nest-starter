import { Injectable } from '@nestjs/common';
import { SessionUser } from '@root/core/auth/auth.schema';
import { CommonResponse } from '@root/core/common/response';
import ServerConfig from '@root/core/config/server.config';
import CoreError from '@root/core/error/core.error';
import CryptUtil from '@root/core/utils/crypt.utils';
import { JwtPayload } from 'jsonwebtoken';
import { WsMiddleware } from '../../define/ws.define';

@Injectable()
export class WsAuthMiddleware {
  use(): WsMiddleware {
    return async (socket, next) => {
      try {
        const { Authorization } = socket.handshake.auth;
        const jwtInfo = CryptUtil.jwtVerify(CryptUtil.getToken(Authorization), ServerConfig.jwt.key) as JwtPayload;
        if (!jwtInfo) {
          const err = new Error('INVALID_TOKEN');
          (err as any).data = CommonResponse.builder().setError(CoreError.INVALID_TOKEN).build();

          return next(err);
        }
        const user: SessionUser = {
          useridx: jwtInfo['useridx'],
          role: jwtInfo['role'],
          nickname: jwtInfo['nickname'],
        };
        socket.data = socket.data || {};
        socket.data.user = user;
        next();
      } catch (err) {
        next(err);
      }
    };
  }
}
