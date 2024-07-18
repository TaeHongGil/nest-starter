import { Body, Controller, Post, Req, Session, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard, NoAuthGuard } from '@root/core/auth/auth.guard';
import { SessionUser } from '@root/core/auth/auth.schema';
import { AuthService } from '@root/core/auth/auth.service';
import serverConfig from '@root/core/config/server.config';
import { jwtVerify } from '@root/core/utils/crypt.utils';
import { Request } from 'express';
import { SessionData } from 'express-session';
import { JwtPayload } from 'jsonwebtoken';
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

  @Post('/create')
  @UseGuards(NoAuthGuard)
  async createAccount(@Session() session: SessionData, @Body() param: ReqCreateUser): Promise<any> {
    const result = await this.accountService.createAccountAsync(param);
    return result;
  }

  @Post('/login')
  @UseGuards(NoAuthGuard)
  async login(@Session() session: SessionData, @Body() param: ReqLogin): Promise<any> {
    const user = await this.accountService.login(session, param);
    const res: ResLogin = {
      accessToken: '',
      refreshToken: '',
    };
    if (serverConfig.jwt.active) {
      const token = await this.authService.setTokenAsync(user);
      res.accessToken = token.accessToken;
      res.refreshToken = token.refreshToken;
    }
    return res;
  }

  @Post('/token/refresh')
  @UseGuards(NoAuthGuard)
  async tokenRefresh(@Session() session: SessionData, @Body() param: ReqTokenRefresh): Promise<any> {
    if (!serverConfig.jwt.active) {
      throw Error('jwt is not activated');
    }
    const jwtInfo = jwtVerify(param.token, serverConfig.jwt.key) as JwtPayload;
    const user: SessionUser = {
      useridx: jwtInfo['useridx'],
      nickname: jwtInfo['nickname'],
    };
    await this.authService.refreshTokenVerifyAsync(user.useridx, param.token);
    const token = await this.authService.setTokenAsync(user);
    const result: ResTokenRefresh = {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    };
    return result;
  }

  @Post('/get')
  @UseGuards(AuthGuard)
  async getAccount(@Session() session: SessionData): Promise<any> {
    const result = await this.accountService.getAccountAsync(session.user.useridx);
    return result;
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request): Promise<any> {
    await this.accountService.deleteLoginStateAsync(req.session.user.useridx);
    req.session.destroy(() => {});
    return true;
  }

  @Post('/delete')
  @UseGuards(AuthGuard)
  async delete(@Req() req: Request): Promise<any> {
    const result = await this.accountService.deleteAccountAsync(req.session.user.useridx);
    req.session.destroy(() => {});
    return result;
  }
}
