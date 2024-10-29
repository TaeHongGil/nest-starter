import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NoAuthGuard } from '@root/core/auth/auth.guard';
import { SessionUser } from '@root/core/auth/auth.schema';
import { AuthService } from '@root/core/auth/auth.service';
import ServerConfig from '@root/core/config/server.config';
import { ServerError } from '@root/core/error/server.error';
import { JwtPayload } from 'jsonwebtoken';
import CryptUtil from '../../core/utils/crypt.utils';
import { ReqTokenRefresh } from '../common/request.dto';
import { ResTokenRefresh } from '../common/response.dto';

/**
 * 게임 계정 및 인증 처리
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * JWT 토큰 Refresh
   */
  @Post('/token')
  @UseGuards(NoAuthGuard)
  async tokenRefresh(@Body() param: ReqTokenRefresh): Promise<any> {
    if (!ServerConfig.jwt.active) {
      throw ServerError.CONFIG_NOT_ACTIVE;
    }
    const jwtInfo = CryptUtil.jwtVerify(param.refresh_token, ServerConfig.jwt.key) as JwtPayload;
    const user: SessionUser = {
      useridx: jwtInfo['useridx'],
      verification: jwtInfo['verification'],
    };
    await this.authService.refreshTokenVerifyAsync(user.useridx, param.refresh_token);
    const result: ResTokenRefresh = {
      jwt: await this.authService.createTokenInfoAsync(user),
    };

    return result;
  }
}
