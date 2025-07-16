import { Injectable } from '@nestjs/common';
import { SessionData, SessionUser } from '@root/core/auth/auth.schema';
import ServerConfig from '@root/core/config/server.config';
import { PLATFORM, ROLE } from '@root/core/define/define';
import CryptUtil from '@root/core/utils/crypt.utils';
import StringUtil from '@root/core/utils/string.utils';
import { AccountRepository } from './account.repository';
import { DBAccount } from './account.schema';

@Injectable()
export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  async getAccountNyUseridxAsync(useridx: number): Promise<DBAccount> {
    return await this.repository.findOne({ useridx });
  }

  async getAccountByIdAsync(id: string): Promise<DBAccount> {
    return await this.repository.findOne({ id });
  }

  async getAccountByNicknameAsync(nickname: string): Promise<DBAccount> {
    return await this.repository.findOne({ nickname });
  }

  async getAllUsersAsync(limit?: number, page?: number, filter?: Record<string, any>): Promise<DBAccount[]> {
    return await this.repository.findAll(limit, page, filter);
  }

  async upsertAccountAsync(account: DBAccount): Promise<DBAccount> {
    return await this.repository.upsert(account);
  }

  async deleteAccountAsync(useridx: number): Promise<boolean> {
    return await this.repository.delete(useridx);
  }

  async deleteLoginStateAsync(useridx: number): Promise<boolean> {
    return await this.repository.deleteLoginState(useridx);
  }

  async setLoginStateAsync(useridx: number): Promise<boolean> {
    return await this.repository.setLoginStateAsync(useridx);
  }

  async checkNicknameAsync(nickname: string): Promise<boolean> {
    return (await this.getAccountByNicknameAsync(nickname)) ? true : false;
  }

  async createAccountAsync(platform: PLATFORM, deviceId: string, nickname?: string): Promise<DBAccount> {
    const id = `${platform}.${CryptUtil.hash(deviceId)}`;
    const user = await this.getAccountByIdAsync(id);
    if (user) {
      return user;
    }

    const useridx = await this.repository.increaseidx();
    const newUser = {
      useridx,
      id,
      nickname: nickname ? nickname : `${StringUtil.toCapitalizedCamelCase(ServerConfig.service.name)}_${useridx}`,
      platform,
      role: ROLE.GUEST,
    };
    await this.repository.upsert(newUser);

    return newUser;
  }

  async loginAsync(session: SessionData, platform: PLATFORM, id: string, nickname?: string): Promise<DBAccount> {
    const accountId = `${platform}.${CryptUtil.hash(id)}`;
    let account = await this.getAccountByIdAsync(accountId);
    if (!account) {
      account = await this.createAccountAsync(platform, id, nickname);
    }

    const user: SessionUser = {
      useridx: account.useridx,
      role: account.role,
      nickname: account.nickname,
    };
    session.user = user;
    await this.setLoginStateAsync(account.useridx);

    return account;
  }
}
