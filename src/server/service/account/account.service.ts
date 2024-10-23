import { Injectable } from '@nestjs/common';
import { SessionUser } from '@root/core/auth/auth.schema';
import { CoreDefine, PLATFORM } from '@root/core/define/define';
import { ServerError } from '@root/core/error/server.error';
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

  async getAccountByIdAsync(platform: PLATFORM, id: string): Promise<DBAccount> {
    return await this.repository.findAccountByIdAsync(`${platform}.${id}`);
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

  async checkEmailAsync(email: string): Promise<boolean> {
    return (await this.getAccountByEmailAsync(email)) ? true : false;
  }

  async checkIdAsync(platform: PLATFORM, id: string): Promise<boolean> {
    return (await this.getAccountByIdAsync(platform, id)) ? true : false;
  }

  async checkNicknameAsync(nickname: string): Promise<boolean> {
    return (await this.getAccountByNicknameAsync(nickname)) ? true : false;
  }

  async createAccountAsync(req: ReqCreateUser): Promise<DBAccount> {
    const useridx = await this.repository.increaseUseridx();
    const account: DBAccount = {
      useridx: useridx,
      id: `${PLATFORM.SERVER}.${req.id}`,
      email: req.email,
      nickname: `${CoreDefine.SERVICE_NAME}${useridx}`,
      password: await CryptUtil.hash(req.password),
      platform: PLATFORM.SERVER,
      create_date: new Date(),
    };

    return account;
  }

  async loginAsync(session: SessionData, req: ReqLogin): Promise<DBAccount> {
    const account = await this.getAccountByIdAsync(PLATFORM.SERVER, req.id);
    if (!account) {
      throw ServerError.USER_NOT_FOUND;
    } else if (!(await CryptUtil.compareHash(req.password, account.password))) {
      throw ServerError.PASSWORD_ERROR;
    }
    const user: SessionUser = {
      useridx: account.useridx,
    };
    session.user = user;
    await this.setLoginStateAsync(account);

    return account;
  }
}
