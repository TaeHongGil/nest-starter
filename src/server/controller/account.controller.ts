import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@root/core/auth/auth.guard';
import { SessionUser } from '@root/core/auth/auth.schema';
import { Request } from 'express';
import { ReqCreateUser, ReqUseridx } from '../common/server.dto';
import { AccountService } from '../service/account/account.service';

/**
 * 게임 계정 및 인증 처리
 */
@Controller('account')
@ApiTags('Account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('/create')
  async createAccount(@Body() req: ReqCreateUser): Promise<any> {
    const result = await this.accountService.createAccountAsync(req);
    return result;
  }

  @Post('/login')
  async login(@Req() req: Request, @Body() body: ReqUseridx): Promise<any> {
    const result = await this.accountService.getAccountAsync(body.useridx);
    await this.accountService.setLoginStateAsync(result);
    req.session.user = new SessionUser(result.useridx, result.nickname);
    return result;
  }

  @Post('/get')
  @UseGuards(AuthGuard)
  async getAccount(@Req() req: Request): Promise<any> {
    const result = await this.accountService.getAccountAsync(req.session.user.useridx);
    return result;
  }

  @Post('/logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request): Promise<any> {
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
