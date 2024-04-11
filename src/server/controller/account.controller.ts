import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  async login(@Body() req: ReqUseridx): Promise<any> {
    const result = await this.accountService.getAccountAsync(req.useridx);
    await this.accountService.setLoginStateAsync(result);
    return result;
  }

  @Post('/delete')
  async delete(@Body() req: ReqUseridx): Promise<any> {
    const result = await this.accountService.deleteAccountAsync(req.useridx);
    return result;
  }

  @Post('/mysql/create')
  async createAccountMysql(@Body() req: ReqCreateUser): Promise<any> {
    const result = await this.accountService.createAccountMysqlAsync(req);
    return result;
  }

  @Post('/mysql/login')
  async loginMysql(@Body() req: ReqUseridx): Promise<any> {
    const result = await this.accountService.getAccountMysqlAsync(req.useridx);
    await this.accountService.setLoginStateAsync(result);
    return result;
  }

  @Post('/mysql/delete')
  async deleteMysql(@Body() req: ReqUseridx): Promise<any> {
    const result = await this.accountService.deleteAccountMysqlAsync(req.useridx);
    return result;
  }
}
