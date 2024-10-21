import { Body, Controller, Get, Logger, Post, Query, Session, UseGuards } from '@nestjs/common';
import { AuthGuard, NoAuthGuard } from '@root/core/auth/auth.guard';
import { SessionUser } from '@root/core/auth/auth.schema';
import { AuthService } from '@root/core/auth/auth.service';
import { CacheService } from '@root/core/cache/cache.service';
import ServerConfig from '@root/core/config/server.config';
import { PLATFORM } from '@root/core/define/define';
import { EmailService } from '@root/core/email/email.service';
import TimeUtil from '@root/core/utils/time.utils';
import { SessionData } from 'express-session';
import { JwtPayload } from 'jsonwebtoken';
import CryptUtil from '../../core/utils/crypt.utils';
import { ResCreateUser, ResLogin, ResTokenRefresh } from '../common/reponse.dto';
import { ReqCreateUser, ReqLogin, ReqPlatformLogin, ReqTokenRefresh } from '../common/request.dto';
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
   */
  @Post('/create')
  @UseGuards(NoAuthGuard)
  async createAccount(@Body() param: ReqCreateUser): Promise<ResCreateUser> {
    if (await this.accountService.checkIdAsync(PLATFORM.SERVER, param.id)) {
      throw new Error('duplicated id');
    } else if (await this.accountService.checkEmailAsync(param.email)) {
      throw new Error('duplicated email');
    }

    const account = await this.accountService.createAccountAsync(param);
    const res: ResCreateUser = {
      nickname: account.nickname,
    };

    if (ServerConfig.account.verification.active) {
      const uuid = CryptUtil.generateUUID();
      const url = new URL(`account/verification?id=${account.id}&uuid=${uuid}`, ServerConfig.account.verification.url_host);
      const expire = ServerConfig.account.verification.expire_sec;
      const content = await this.emailService.readHtml('verification', {
        link: url.toString(),
        expire: TimeUtil.secToString(expire),
      });
      this.emailService
        .sendMail(ServerConfig.stmp.name, account.email, '계정 인증', '', content)
        .then(async (): Promise<void> => await this.cacheService.set(account.id, { uuid: uuid, account: account }, expire))
        .catch((e) => Logger.error(e));
    } else {
      await this.accountService.upsertAccountAsync(account);
    }

    return res;
  }

  /**
   * 계정 검증
   */
  @Get('/verification')
  @UseGuards(NoAuthGuard)
  async emailVerificaiton(@Query('id') id: string, @Query('uuid') uuid: string): Promise<ResCreateUser> {
    try {
      const accountInfo = await this.cacheService.get(id);
      if (!accountInfo || accountInfo['uuid'] != uuid) {
        throw new Error('uuid not found');
      }
      const account = accountInfo['account'] as DBAccount;
      if (await this.accountService.checkIdAsync(PLATFORM.SERVER, account.id)) {
        throw new Error('duplicated id');
      } else if (await this.accountService.checkEmailAsync(account.email)) {
        throw new Error('duplicated email');
      }
      await this.accountService.upsertAccountAsync(account);

      const res: ResCreateUser = {
        nickname: account.nickname,
      };

      return res;
    } finally {
      await this.cacheService.delete(id);
    }
  }

  /**
   * 로그인
   */
  @Post('/login')
  @UseGuards(NoAuthGuard)
  async login(@Session() session: SessionData, @Body() param: ReqLogin): Promise<any> {
    const account = await this.accountService.loginAsync(session, param);
    const res: ResLogin = {
      accessToken: '',
      refreshToken: '',
      nickname: account.nickname,
    };
    if (ServerConfig.jwt.active) {
      res.accessToken = await this.authService.createAccessTokenAsync(session.user);
      res.refreshToken = await this.authService.createRefreshTokenAsync(session.user);
    }

    return res;
  }

  /**
   * 플랫폼 로그인
   */
  @Post('/platform/login')
  @UseGuards(NoAuthGuard)
  async paltformlogin(@Session() session: SessionData, @Body() param: ReqPlatformLogin): Promise<any> {
    const id = await this.accountPlatformService.getPlatformIdAsync(param.platform, param.token);
    if (!id) {
      throw new Error('user not found');
    }
    const account = await this.accountPlatformService.platformLogin(session, param.platform, id);
    const res: ResLogin = {
      accessToken: '',
      refreshToken: '',
      nickname: account.nickname,
    };
    if (ServerConfig.jwt.active) {
      res.accessToken = await this.authService.createAccessTokenAsync(session.user);
      res.refreshToken = await this.authService.createRefreshTokenAsync(session.user);
    }

    return res;
  }

  /**
   * JWT 토큰 Refresh
   */
  @Post('/token/refresh')
  @UseGuards(NoAuthGuard)
  async tokenRefresh(@Body() param: ReqTokenRefresh): Promise<any> {
    if (!ServerConfig.jwt.active) {
      throw Error('jwt is not activated');
    }
    const jwtInfo = CryptUtil.jwtVerify(param.refreshToken, ServerConfig.jwt.key) as JwtPayload;
    const user: SessionUser = {
      useridx: jwtInfo['useridx'],
    };
    await this.authService.refreshTokenVerifyAsync(user.useridx, param.refreshToken);
    const result: ResTokenRefresh = {
      accessToken: await this.authService.createAccessTokenAsync(user),
    };

    return result;
  }

  /**
   * 계정 정보
   */
  @Post('/get')
  @UseGuards(AuthGuard)
  async getAccount(@Session() session: SessionData): Promise<any> {
    const result = await this.accountService.getAccountNyUseridxAsync(session.user.useridx);

    return result;
  }

  /**
   * 로그아웃
   */
  @Post('/logout')
  @UseGuards(AuthGuard)
  async logout(@Session() session: SessionData): Promise<any> {
    await this.accountService.deleteLoginStateAsync(session.user.useridx);
    session.request.session.destroy(() => {});

    return true;
  }

  /**
   * 계정삭제
   */
  @Post('/delete')
  @UseGuards(AuthGuard)
  async deleteAccount(@Session() session: SessionData): Promise<any> {
    const result = await this.accountService.deleteAccountAsync(session.user.useridx);
    session.request.session.destroy(() => {});

    return { result: result };
  }

  /**
   * 계정이 현재 접속중인지 확인
   * 15분 동안 유지 된다.
   */
  @Post('/ping')
  @UseGuards(AuthGuard)
  async ping(@Session() session: SessionData): Promise<any> {
    const result = await this.accountService.refreshLoginStateAsync(session.user.useridx);

    return { result: result };
  }
}
