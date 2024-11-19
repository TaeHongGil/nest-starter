import { Injectable } from '@nestjs/common';
import { SessionUser } from '@root/core/auth/auth.schema';
import ServerConfig from '@root/core/config/server.config';
import { PLATFORM } from '@root/core/define/define';
import ServerError from '@root/core/error/server.error';
import StringUtil from '@root/core/utils/string.utils';
import { ReqCreateUser, ReqLogin } from '@root/server/common/request.dto';
import { SessionData } from 'express-session';
import CryptUtil from '../../../core/utils/crypt.utils';
import { AccountRepository } from './account.repository';
import { DBAccount } from './account.schema';

@Injectable()
export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  async getAccountNyUseridxAsync(useridx: number): Promise<DBAccount> {
    return await this.repository.findOne({ useridx });
  }

  async getAccountByEmailAsync(email: string): Promise<DBAccount> {
    return await this.repository.findOne({ email });
  }

  async getAccountByIdAsync(platform: PLATFORM, id: string): Promise<DBAccount> {
    return await this.repository.findOne({ id: `${platform}.${id}` });
  }

  async getAccountByNicknameAsync(nickname: string): Promise<DBAccount> {
    return await this.repository.findOne({ nickname });
  }

  async upsertAccountAsync(account: DBAccount, ttl_msec?: number): Promise<DBAccount> {
    return await this.repository.upsert(account, ttl_msec);
  }

  async deleteAccountAsync(useridx: number): Promise<boolean> {
    return await this.repository.delete(useridx);
  }

  async setLoginStateAsync(account: DBAccount): Promise<boolean> {
    return await this.repository.setLoginState(account);
  }

  async deleteLoginStateAsync(useridx: number): Promise<boolean> {
    return await this.repository.deleteLoginState(useridx);
  }

  async refreshLoginStateAsync(useridx: number): Promise<boolean> {
    return await this.repository.refreshLoginState(useridx);
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
    const useridx = await this.repository.increaseidx();
    const account: DBAccount = {
      useridx: useridx,
      id: `${PLATFORM.SERVER}.${req.id}`,
      email: req.email,
      nickname: req.nickname || `${StringUtil.toCapitalizedCamelCase(ServerConfig.service.name)}${useridx}`,
      password: await CryptUtil.hash(req.password),
      platform: PLATFORM.SERVER,
      role: 0,
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
      role: account.role,
      nickname: account.nickname,
    };
    session.user = user;
    await this.setLoginStateAsync(account);

    return account;
  }
}
