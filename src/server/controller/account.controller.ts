import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReqCreateUser } from '../common/server.dto';
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
    const result = await this.accountService.upsertAccountAsync(req);
    return result;
  }

  @Post('/login')
  async login(): Promise<any> {
    const result = await this.accountService.getAccountAsync(0);
    return result;
  }

  @Post('/delete')
  async delete(): Promise<any> {
    const result = await this.accountService.deleteAccountAsync(0);
    return result;
  }
}
