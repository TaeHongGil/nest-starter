import { Body, Controller, Post, Session } from '@nestjs/common';
import { SessionData } from '@root/core/auth/auth.schema';
import { AuthService } from '@root/core/auth/auth.service';
import ServerConfig from '@root/core/config/server.config';
import { NoAuthGuard } from '@root/core/decorator/common.decorator';
import { PLATFORM } from '@root/core/define/define';
import { GoogleAccountService } from '@root/core/google/google.account.service';
import { AccountService } from '@root/server/api/service/account/account.service';
import { ReqGoogleLogin } from '../dto/api.request.dto';
import { ResLogin } from '../dto/api.response.dto';

/**
 * 계정 컨트롤러
 */
@Controller('google')
export class GoogleController {
  constructor(
    private readonly accountService: AccountService,
    private readonly googleAccountService: GoogleAccountService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 구글 로그인
   */
  @Post('/login')
  @NoAuthGuard()
  async googleLogin(@Session() session: SessionData, @Body() param: ReqGoogleLogin): Promise<ResLogin> {
    const payload = await this.googleAccountService.getGoogleAsync(param.token);
    const account = await this.accountService.loginAsync(session, PLATFORM.GOOGLE, payload.sub, payload.name);
    const jwt = await this.authService.createTokenInfoAsync(session.user);
    const refresh_token = await this.authService.createRefreshTokenAsync(session.user);
    session.response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: ServerConfig.zone != 'local',
      path: '/',
    });

    const res: ResLogin = {
      nickname: account.nickname,
      role: account.role,
      jwt,
      profile: {
        name: payload.name,
        email: payload.email,
      },
    };

    return res;
  }
}
