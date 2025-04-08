import { Body, Controller, Delete, Get, Post, Query, Req, Session, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard, NoAuthGuard } from '@root/core/auth/auth.guard';
import { AuthService } from '@root/core/auth/auth.service';
import { CacheService } from '@root/core/cache/cache.service';
import { CUSTOM_METADATA } from '@root/core/define/define';
import { Request } from 'express';
import { SessionData } from 'express-session';
import { ReqCreateGuest, ReqGuestLogin, ReqPlatformLogin } from '../common/request.dto';
import { ResCreateUser as ResCreateGuest, ResDuplicatedCheck, ResGetAccount, ResLogin } from '../common/response.dto';
import { AccountPlatformService } from '../service/account/account.platform.service';
import { AccountService } from '../service/account/account.service';

/**
 * 게임 계정 및 인증 처리
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
  @UseGuards(NoAuthGuard)
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
  @UseGuards(NoAuthGuard)
  async login(@Session() session: SessionData, @Body() param: ReqGuestLogin): Promise<ResLogin> {
    const account = await this.accountService.loginAsync(session, param);
    const res: ResLogin = {
      nickname: account.nickname,
      role: account.role,
    };
    res.jwt = await this.authService.createTokenInfoAsync(session.user);

    return res;
  }

  /**
   * 플랫폼 로그인
   */
  @Post('/platform/login')
  @UseGuards(NoAuthGuard)
  async paltformlogin(@Session() session: SessionData, @Body() param: ReqPlatformLogin): Promise<ResLogin> {
    const platformId = await this.accountPlatformService.getPlatformIdAsync(param.platform, param.token);
    const account = await this.accountPlatformService.platformLogin(session, param.platform, platformId);
    const res: ResLogin = {
      nickname: account.nickname,
      role: account.role,
    };
    res.jwt = await this.authService.createTokenInfoAsync(session.user);

    return res;
  }

  /**
   * 계정 정보
   */
  @Get('/get')
  @UseGuards(AuthGuard)
  async getAccount(@Session() session: SessionData): Promise<ResGetAccount> {
    const account = await this.accountService.getAccountNyUseridxAsync(session.user.useridx);

    return { nickname: account.nickname };
  }

  /**
   * 닉네임 중복 검사
   */
  @Get('/check/nickname')
  @UseGuards(NoAuthGuard)
  async checkNickname(@Session() session: SessionData, @Query('nickname') nickname: string): Promise<ResDuplicatedCheck> {
    const account = await this.accountService.getAccountByNicknameAsync(nickname);

    return { result: account ? true : false };
  }

  /**
   * 로그아웃
   */
  @Post('/logout')
  @UseGuards(AuthGuard)
  @SetMetadata(CUSTOM_METADATA.NOT_VERIFIED, true)
  async logout(@Session() session: SessionData, @Req() req: Request): Promise<any> {
    await this.accountService.deleteLoginStateAsync(session.user.useridx);
    await this.authService.deleteRefreshTokenAsync(session.user.useridx);

    return { message: 'success' };
  }

  /**
   * 계정삭제
   */
  @Delete('/delete')
  @UseGuards(AuthGuard)
  async deleteAccount(@Session() session: SessionData, @Req() req: Request): Promise<any> {
    await this.accountService.deleteLoginStateAsync(session.user.useridx);
    await this.authService.deleteRefreshTokenAsync(session.user.useridx);
    await this.accountService.deleteAccountAsync(session.user.useridx);

    return { message: 'success' };
  }

  /**
   * 계정이 현재 접속중인지 확인
   * 15분 동안 유지 된다.
   */
  @Post('/ping')
  @UseGuards(AuthGuard)
  @SetMetadata(CUSTOM_METADATA.NOT_VERIFIED, true)
  async ping(@Session() session: SessionData): Promise<any> {
    const result = await this.accountService.refreshLoginStateAsync(session.user.useridx);

    return { result: result };
  }
}
