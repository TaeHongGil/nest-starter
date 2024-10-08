import { Body, Controller, Get, Logger, Post, Query, Session, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard, NoAuthGuard } from '@root/core/auth/auth.guard';
import { SessionUser } from '@root/core/auth/auth.schema';
import { AuthService } from '@root/core/auth/auth.service';
import { CacheService } from '@root/core/cache/cache.service';
import ServerConfig from '@root/core/config/server.config';
import { EmailService } from '@root/core/email/email.service';
import TimeUtil from '@root/core/utils/time.utils';
import { SessionData } from 'express-session';
import { JwtPayload } from 'jsonwebtoken';
import CryptUtil from '../../core/utils/crypt.utils';
import { ResCreateUser, ResLogin, ResTokenRefresh } from '../common/reponse.dto';
import { ReqCreateUser, ReqLogin, ReqTokenRefresh } from '../common/request.dto';
import { DBAccount } from '../service/account/account.schema';
import { AccountService } from '../service/account/account.service';

/**
 * 게임 계정 및 인증 처리
 */
@Controller('account')
@ApiTags('Account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
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
    if ((await this.cacheService.has(param.email)) || (await this.accountService.checkEmail(param.email))) {
      throw new Error('duplicated email');
    }

    const account = await this.accountService.createAccountAsync(param);
    const res: ResCreateUser = {
      nickname: account.nickname,
    };

    if (ServerConfig.account.verification.active) {
      const uuid = CryptUtil.generateUUID();
      const url = new URL(`account/verification?email=${account.email}&uuid=${uuid}`, ServerConfig.account.verification.url_host);
      const expire = ServerConfig.account.verification.expire_sec;
      const content = await this.emailService.readHtml('verification', {
        link: url.toString(),
        expire: TimeUtil.secToString(expire),
      });
      this.emailService
        .sendMail(ServerConfig.stmp.name, account.email, '계정 인증', '', content)
        .then(async (): Promise<void> => await this.cacheService.set(account.email, { uuid: uuid, account: account }, expire))
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
  async emailVerificaiton(@Query('email') email: string, @Query('uuid') uuid: string): Promise<ResCreateUser> {
    const accountInfo = await this.cacheService.get(email);
    if (!accountInfo || accountInfo['uuid'] != uuid) {
      throw new Error('uuid not found');
    }
    const account = accountInfo['account'] as DBAccount;
    await this.accountService.upsertAccountAsync(account);
    await this.cacheService.delete(email);

    const res: ResCreateUser = {
      nickname: account.nickname,
    };

    return res;
  }

  /**
   * 로그인
   */
  @Post('/login')
  @UseGuards(NoAuthGuard)
  async login(@Session() session: SessionData, @Body() param: ReqLogin): Promise<any> {
    const user = await this.accountService.loginAsync(session, param);
    if (ServerConfig.jwt.active) {
      const res: ResLogin = {
        accessToken: await this.authService.createAccessTokenAsync(user),
        refreshToken: await this.authService.createRefreshTokenAsync(user),
      };

      return res;
    }

    return {};
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
    const jwtInfo = CryptUtil.jwtVerify(param.token, ServerConfig.jwt.key) as JwtPayload;
    const user: SessionUser = {
      useridx: jwtInfo['useridx'],
    };
    await this.authService.refreshTokenVerifyAsync(user.useridx, param.token);
    const result: ResTokenRefresh = {
      accessToken: await this.authService.createAccessTokenAsync(user),
      refreshToken: await this.authService.createRefreshTokenAsync(user),
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
  async delete(@Session() session: SessionData): Promise<any> {
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
