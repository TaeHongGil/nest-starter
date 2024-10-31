import { Body, Controller, Delete, Get, Post, Query, Req, Session, UseGuards } from '@nestjs/common';
import { AuthGuard, NoAuthGuard } from '@root/core/auth/auth.guard';
import { AuthService } from '@root/core/auth/auth.service';
import { CacheService } from '@root/core/cache/cache.service';
import ServerConfig from '@root/core/config/server.config';
import { CoreDefine, PLATFORM } from '@root/core/define/define';
import { EmailService } from '@root/core/email/email.service';
import { ServerError } from '@root/core/error/server.error';
import TimeUtil from '@root/core/utils/time.utils';
import { Request } from 'express';
import { SessionData } from 'express-session';
import CryptUtil from '../../core/utils/crypt.utils';
import { ReqCreateUser, ReqLogin, ReqPlatformLogin } from '../common/request.dto';
import { ResCreateUser, ResDuplicatedCheck, ResGetAccount, ResLogin, ResVerificationSend } from '../common/response.dto';
import { AccountPlatformService } from '../service/account/account.platform.service';
import { DBAccount } from '../service/account/account.schema';
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
    private readonly emailService: EmailService,
  ) {}

  /**
   * 계정을 생성한다.
   * expire가 0이 아닐 시 해당 시간 안에 이메일 인증을 받지 않으면 계정이 삭제된다
   */
  @Post('/create')
  @UseGuards(NoAuthGuard)
  async createAccount(@Body() param: ReqCreateUser): Promise<ResCreateUser> {
    const account = await this.accountService.createAccountAsync(param);
    const res: ResCreateUser = {
      nickname: account.nickname,
      expires_msec: ServerConfig.account.verification.active ? CoreDefine.ONE_HOUR_MSEC : 0,
    };
    await this.accountService.upsertAccountAsync(account, ServerConfig.account.verification.active ? CoreDefine.ONE_HOUR_MSEC : undefined);

    return res;
  }

  /**
   * 계정 검증
   */
  @Get('/verification')
  @UseGuards(NoAuthGuard)
  async emailVerificaiton(@Query('id') id: string, @Query('uuid') uuid: string): Promise<any> {
    try {
      const info = await this.cacheService.get(id);
      if (!info || info['uuid'] != uuid) {
        throw ServerError.USER_NOT_FOUND;
      }
      const account = info['account'] as DBAccount;
      account.verification = -1;
      await this.accountService.upsertAccountAsync(account, 0);

      return { message: 'Please login again' };
    } finally {
      await this.cacheService.delete(id);
    }
  }

  /**
   * 계정 검증 이메일 보내기
   */
  @Post('/verification/send')
  @UseGuards(AuthGuard(false))
  async sendVerificaiton(@Session() session: SessionData): Promise<ResVerificationSend> {
    if (!ServerConfig.account.verification.active) {
      throw ServerError.CONFIG_NOT_ACTIVE;
    }
    const account = await this.accountService.getAccountNyUseridxAsync(session.user.useridx);
    if (!account) {
      throw ServerError.USER_NOT_FOUND;
    } else if (account.verification == -1) {
      throw ServerError.EMAIL_ALREADY_VERIFIED;
    } else if (account.verification > Date.now()) {
      throw ServerError.TOO_MANY_REQUEST;
    }
    const uuid = CryptUtil.generateUUID();
    const url = new URL(`account/verification?id=${account.id}&uuid=${uuid}`, ServerConfig.account.verification.url_host);
    const expires_msec = ServerConfig.account.verification.expires_msec;
    const content = await this.emailService.readHtml('verification', {
      link: url.toString(),
      expires_msec: TimeUtil.msecToString(expires_msec),
    });
    await this.emailService.sendMail(ServerConfig.service.name, account.email, '계정 인증', '', content);
    await this.cacheService.set(account.id, { uuid, account }, expires_msec);
    account.verification = Date.now() + ServerConfig.account.verification.retry_msec;
    await this.accountService.upsertAccountAsync(account);

    return { retry_msec: ServerConfig.account.verification.retry_msec };
  }

  /**
   * 로그인
   */
  @Post('/login')
  @UseGuards(NoAuthGuard)
  async login(@Session() session: SessionData, @Body() param: ReqLogin): Promise<ResLogin> {
    const account = await this.accountService.loginAsync(session, param);
    const res: ResLogin = {
      nickname: account.nickname,
    };
    if (ServerConfig.jwt.active) {
      res.jwt = await this.authService.createTokenInfoAsync(session.user);
    }

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
    };
    if (ServerConfig.jwt.active) {
      res.jwt = await this.authService.createTokenInfoAsync(session.user);
    }

    return res;
  }

  /**
   * 계정 정보
   */
  @Get('/get')
  @UseGuards(AuthGuard())
  async getAccount(@Session() session: SessionData): Promise<ResGetAccount> {
    const account = await this.accountService.getAccountNyUseridxAsync(session.user.useridx);

    return { nickname: account.nickname };
  }

  /**
   * 이메일 중복 검사
   */
  @Get('/check/email')
  @UseGuards(NoAuthGuard)
  async checkEmail(@Session() session: SessionData, @Query('email') email: string): Promise<ResDuplicatedCheck> {
    const account = await this.accountService.getAccountByEmailAsync(email);

    return { result: account ? true : false };
  }

  /**
   * ID 중복 검사
   */
  @Get('/check/id')
  @UseGuards(NoAuthGuard)
  async checkId(@Session() session: SessionData, @Query('id') id: string): Promise<ResDuplicatedCheck> {
    const account = await this.accountService.getAccountByIdAsync(PLATFORM.SERVER, id);

    return { result: account ? true : false };
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
  @UseGuards(AuthGuard(false))
  async logout(@Session() session: SessionData, @Req() req: Request): Promise<any> {
    await this.accountService.deleteLoginStateAsync(session.user.useridx);
    if (ServerConfig.session.active) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Failed to destroy session:', err);
        }
      });
    } else {
      await this.authService.deleteRefreshTokenAsync(session.user.useridx);
    }

    return { message: 'success' };
  }

  /**
   * 계정삭제
   */
  @Delete('/delete')
  @UseGuards(AuthGuard())
  async deleteAccount(@Session() session: SessionData, @Req() req: Request): Promise<any> {
    await this.accountService.deleteLoginStateAsync(session.user.useridx);
    const result = await this.accountService.deleteAccountAsync(session.user.useridx);
    if (ServerConfig.session.active) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Failed to destroy session:', err);
        }
      });
    } else {
      await this.authService.deleteRefreshTokenAsync(session.user.useridx);
    }

    return { message: 'success' };
  }

  /**
   * 계정이 현재 접속중인지 확인
   * 15분 동안 유지 된다.
   */
  @Post('/ping')
  @UseGuards(AuthGuard(false))
  async ping(@Session() session: SessionData): Promise<any> {
    const result = await this.accountService.refreshLoginStateAsync(session.user.useridx);

    return { result: result };
  }
}
