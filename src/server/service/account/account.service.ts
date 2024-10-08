import { Injectable } from '@nestjs/common';
import { SessionUser } from '@root/core/auth/auth.schema';
import ServerConfig from '@root/core/config/server.config';
import { CoreDefine } from '@root/core/define/define';
import { ReqCreateUser, ReqLogin } from '@root/server/common/request.dto';
import { SessionData } from 'express-session';
import CryptUtil from '../../../core/utils/crypt.utils';
import { AccountRepository } from './account.repository';
import { DBAccount } from './account.schema';

@Injectable()
export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  async getAccountNyUseridxAsync(useridx: number): Promise<DBAccount> {
    return await this.repository.findAccountByUseridxAsync(useridx);
  }

  async getAccountByEmailAsync(email: string): Promise<DBAccount> {
    return await this.repository.findAccountByEmailAsync(email);
  }

  async getAccountByNicknameAsync(nickname: string): Promise<DBAccount> {
    return await this.repository.findAccountByNicknameAsync(nickname);
  }

  async upsertAccountAsync(account: DBAccount): Promise<DBAccount> {
    return await this.repository.upsertAccountAsync(account);
  }

  async deleteAccountAsync(useridx: number): Promise<boolean> {
    return await this.repository.deleteAccountAsync(useridx);
  }

  async setLoginStateAsync(account: DBAccount): Promise<boolean> {
    return await this.repository.setLoginStateAsync(account);
  }

  async deleteLoginStateAsync(useridx: number): Promise<boolean> {
    return await this.repository.deleteLoginStateAsync(useridx);
  }

  async refreshLoginStateAsync(useridx: number): Promise<boolean> {
    return await this.repository.refreshLoginStateAsync(useridx);
  }

  async checkEmail(email: string): Promise<boolean> {
    return (await this.repository.findAccountByEmailAsync(email)) ? true : false;
  }

  async createAccountAsync(req: ReqCreateUser): Promise<DBAccount> {
    const useridx = await this.repository.increaseUseridx();
    const account: DBAccount = {
      useridx: useridx,
      email: req.email,
      nickname: `${CoreDefine.SERVER_NAME}${useridx}`,
      password: await CryptUtil.hash(req.password),
    };

    return account;
  }

  async loginAsync(session: SessionData, param: ReqLogin): Promise<SessionUser> {
    const account = await this.getAccountByEmailAsync(param.email);
    if (!(await CryptUtil.compareHash(param.password, account.password))) {
      throw new Error('password error');
    }
    const user: SessionUser = {
      useridx: account.useridx,
    };
    if (ServerConfig.session.active) {
      session.user = user;
    }
    await this.setLoginStateAsync(account);

    return user;
  }
}
