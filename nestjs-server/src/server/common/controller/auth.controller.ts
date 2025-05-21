import { Controller, Post, Session } from '@nestjs/common';
import { SessionData, SessionUser } from '@root/core/auth/auth.schema';
import { AuthService } from '@root/core/auth/auth.service';
import ServerConfig from '@root/core/config/server.config';
import ServerError from '@root/core/error/server.error';
import { NoAuthGuard } from '@root/core/guard/auth.guard';
import CryptUtil from '@root/core/utils/crypt.utils';
import { JwtPayload } from 'jsonwebtoken';
import { ResTokenRefresh } from '../dto/common.response.dto';
import { AccountService } from '../service/account/account.service';

/**
 * 인증 컨트롤러
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * JWT 토큰 Refresh
   */
  @Post('/token')
  @NoAuthGuard()
  async tokenRefresh(@Session() session: SessionData): Promise<ResTokenRefresh> {
    const req_refresh_token = session.request.cookies.refresh_token;
    const jwtInfo = CryptUtil.jwtVerify(req_refresh_token, ServerConfig.jwt.key) as JwtPayload;
    if (!jwtInfo) {
      throw ServerError.INVALID_TOKEN;
    }
    const user: SessionUser = {
      useridx: jwtInfo['useridx'],
      role: jwtInfo['role'],
      nickname: jwtInfo['nickname'],
    };
    await this.authService.refreshTokenVerifyAsync(user.useridx, req_refresh_token);
    await this.accountService.setLoginStateAsync(user.useridx);
    const res_refresh_token = await this.authService.createRefreshTokenAsync(user);
    session.response.cookie('refresh_token', res_refresh_token, {
      httpOnly: true,
      secure: ServerConfig.serverType !== 'local',
      path: '/',
    });

    const res: ResTokenRefresh = {
      jwt: await this.authService.createTokenInfoAsync(user),
    };
    return res;
  }
}
