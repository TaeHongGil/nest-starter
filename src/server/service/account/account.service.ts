import { Injectable } from '@nestjs/common';
import { SessionUser } from '@root/core/auth/auth.schema';
import ServerConfig from '@root/core/config/server.config';
import { ReqCreateUser, ReqLogin } from '@root/server/common/request.dto';
import { SessionData } from 'express-session';
import { AccountRepository } from './account.repository';
import { Account, DBAccount } from './account.schema';

@Injectable()
export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  /**
   * Mongo
   */
  async getAccountAsync(useridx: number): Promise<DBAccount> {
    const db = await this.repository.findAccountAsync(useridx);
    return db;
  }

  async createAccountAsync(req: ReqCreateUser): Promise<DBAccount> {
    const account = new DBAccount();
    account.id = req.id;
    account.password = req.password;
    account.nickname = req.nickname;
    const db = await this.repository.createAccountAsync(account);
    return db;
  }

  async deleteAccountAsync(useridx: number): Promise<boolean> {
    const db = await this.repository.deleteAccountAsync(useridx);
    return db;
  }

  // /**
  //  * Mysql
  //  */
  // async getAccountMysqlAsync(useridx: number): Promise<DBAccount> {
  //   const db = await this.repository.findAccountMysqlAsync(useridx);
  //   return db;
  // }

  // async createAccountMysqlAsync(req: ReqCreateUser): Promise<InsertResult> {
  //   const account = new DBAccountMysql();
  //   account.id = req.id;
  //   account.password = req.password;
  //   account.nickname = req.nickname;
  //   const db = await this.repository.createAccountMysqlAsync(account);
  //   return db;
  // }

  // async deleteAccountMysqlAsync(useridx: number): Promise<DeleteResult> {
  //   const db = await this.repository.deleteAccountMysqlAsync(useridx);
  //   return db;
  // }

  async setLoginStateAsync(account: Account): Promise<boolean> {
    return await this.repository.setLoginStateAsync(account);
  }

  async deleteLoginStateAsync(useridx: number): Promise<boolean> {
    return await this.repository.deleteLoginStateAsync(useridx);
  }

  async login(session: SessionData, param: ReqLogin): Promise<SessionUser> {
    const account = await this.getAccountAsync(param.useridx);
    const user: SessionUser = {
      useridx: account.useridx,
      nickname: account.nickname,
    };
    if (ServerConfig.session.active) {
      session.user = user;
    }
    await this.setLoginStateAsync(account);
    return user;
  }
}
