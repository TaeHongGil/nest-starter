import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NoAuthGuard } from '@root/core/auth/auth.guard';
import { SessionUser } from '@root/core/auth/auth.schema';
import { AuthService } from '@root/core/auth/auth.service';
import ServerConfig from '@root/core/config/server.config';
import ServerError from '@root/core/error/server.error';
import CryptUtil from '@root/core/utils/crypt.utils';
import { JwtPayload } from 'jsonwebtoken';
import { ReqTokenRefresh } from '../dto/common.request.dto';
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
  @UseGuards(NoAuthGuard)
  async tokenRefresh(@Body() param: ReqTokenRefresh): Promise<any> {
    const jwtInfo = CryptUtil.jwtVerify(param.refresh_token, ServerConfig.jwt.key) as JwtPayload;
    if (!jwtInfo) {
      throw ServerError.INVALID_TOKEN;
    }
    const user: SessionUser = {
      useridx: jwtInfo['useridx'],
      role: jwtInfo['role'],
      nickname: jwtInfo['nickname'],
    };
    await this.authService.refreshTokenVerifyAsync(user.useridx, param.refresh_token);
    const result: ResTokenRefresh = {
      jwt: await this.authService.createTokenInfoAsync(user),
    };
    await this.accountService.setLoginStateAsync(user.useridx);

    return result;
  }
}
