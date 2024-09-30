import { Body, Controller, Post, Session, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard, NoAuthGuard } from '@root/core/auth/auth.guard';
import { SessionUser } from '@root/core/auth/auth.schema';
import { AuthService } from '@root/core/auth/auth.service';
import ServerConfig from '@root/core/config/server.config';
import { SessionData } from 'express-session';
import { JwtPayload } from 'jsonwebtoken';
import CryptUtil from '../../core/utils/crypt.utils';
import { ResLogin, ResTokenRefresh } from '../common/reponse.dto';
import { ReqCreateUser, ReqLogin, ReqTokenRefresh } from '../common/request.dto';
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
  ) {}

  /**
   * 계정을 생성한다.
   */
  @Post('/create')
  @UseGuards(NoAuthGuard)
  async createAccount(@Session() session: SessionData, @Body() param: ReqCreateUser): Promise<any> {
    const result = await this.accountService.createAccountAsync(param);

    return result;
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
  async tokenRefresh(@Session() session: SessionData, @Body() param: ReqTokenRefresh): Promise<any> {
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
