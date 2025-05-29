import { Body, Controller, Delete, Get, Post, Query, Session } from '@nestjs/common';
import { SessionData } from '@root/core/auth/auth.schema';
import { AuthService } from '@root/core/auth/auth.service';
import { CacheService } from '@root/core/cache/cache.service';
import ServerConfig from '@root/core/config/server.config';
import ServerError from '@root/core/error/server.error';
import { NoAuthGuard } from '@root/core/guard/auth.guard';
import { ReqCheckNickname, ReqCreateGuest, ReqGuestLogin, ReqPlatformLogin } from '../dto/api.request.dto';
import { ResCreateGuest, ResDuplicatedCheck, ResGetAccount, ResLogin } from '../dto/api.response.dto';
import { AccountPlatformService } from '../service/account/account.platform.service';
import { AccountService } from '../service/account/account.service';

/**
 * 계정 컨트롤러
 */
@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly accountPlatformService: AccountPlatformService,
    private readonly authService: AuthService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 게스트 계정을 생성한다.
   */
  @Post('/guest/create')
  async createGuestAccount(@Session() session: SessionData, @Body() param: ReqCreateGuest): Promise<ResCreateGuest> {
    const guestAccount = await this.accountService.createGuestAccountAsync(param.device_id);
    const res: ResCreateGuest = {
      nickname: guestAccount.nickname,
      uuid: guestAccount.id,
    };

    return res;
  }

  /**
   * 로그인
   */
  @Post('/guest/login')
  @NoAuthGuard()
  async login(@Session() session: SessionData, @Body() param: ReqGuestLogin): Promise<ResLogin> {
    const account = await this.accountService.loginAsync(session, param);
    const jwt = await this.authService.createTokenInfoAsync(session.user);
    const refresh_token = await this.authService.createRefreshTokenAsync(session.user);
    session.response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: ServerConfig.serverType != 'local',
      path: '/',
    });

    const resData: ResLogin = {
      nickname: account.nickname,
      role: account.role,
      jwt,
    };

    return resData;
  }

  /**
   * 플랫폼 로그인
   */
  @Post('/platform/login')
  @NoAuthGuard()
  async paltformlogin(@Session() session: SessionData, @Body() param: ReqPlatformLogin): Promise<ResLogin> {
    const platformId = await this.accountPlatformService.getPlatformIdAsync(param.platform, param.token);
    const account = await this.accountPlatformService.platformLogin(session, param.platform, platformId);
    const jwt = await this.authService.createTokenInfoAsync(session.user);
    const refresh_token = await this.authService.createRefreshTokenAsync(session.user);
    session.response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: ServerConfig.serverType != 'local',
      path: '/',
    });

    const res: ResLogin = {
      nickname: account.nickname,
      role: account.role,
      jwt,
    };

    return res;
  }

  /**
   * 계정 정보
   */
  @Get('/get')
  async getAccount(@Session() session: SessionData): Promise<ResGetAccount> {
    const account = await this.accountService.getAccountNyUseridxAsync(session.user.useridx);
    if (!account) {
      throw ServerError.USER_NOT_FOUND;
    }

    return { nickname: account.nickname };
  }

  /**
   * 닉네임 중복 검사
   */
  @Get('/check/nickname')
  @NoAuthGuard()
  async checkNickname(@Session() session: SessionData, @Query() req: ReqCheckNickname): Promise<ResDuplicatedCheck> {
    if (!req.nickname || !req.nickname.trim()) {
      throw ServerError.BAD_REQUEST;
    }
    const account = await this.accountService.getAccountByNicknameAsync(req.nickname);

    return { result: account ? true : false };
  }

  /**
   * 로그아웃
   */
  @Post('/logout')
  async logout(@Session() session: SessionData): Promise<any> {
    await this.accountService.deleteLoginStateAsync(session.user.useridx);
    await this.authService.deleteRefreshTokenAsync(session.user.useridx);

    return { message: 'success' };
  }

  /**
   * 계정삭제
   */
  @Delete('/delete')
  async deleteAccount(@Session() session: SessionData): Promise<any> {
    await this.accountService.deleteLoginStateAsync(session.user.useridx);
    await this.authService.deleteRefreshTokenAsync(session.user.useridx);
    await this.accountService.deleteAccountAsync(session.user.useridx);

    return { message: 'success' };
  }
}
