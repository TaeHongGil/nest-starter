import { Injectable } from '@nestjs/common';
import { ReqCreateUser } from '@root/server/common/server.dto';
import { DeleteResult, InsertResult } from 'typeorm';
import { DBAccountMysql } from './account.entity';
import { AccountRepository } from './account.repository';
import { DBAccount } from './account.schema';

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
    const account: DBAccount = {
      useridx: 0,
      id: req.id,
      password: req.password,
      nickname: req.nickname,
    };
    const db = await this.repository.createAccountAsync(account);
    return db;
  }

  async deleteAccountAsync(useridx: number): Promise<boolean> {
    const db = await this.repository.deleteAccountAsync(useridx);
    return db;
  }

  /**
   * Mysql
   */
  async getAccountMysqlAsync(useridx: number): Promise<DBAccount> {
    const db = await this.repository.findAccountMysqlAsync(useridx);
    return db;
  }

  async createAccountMysqlAsync(req: ReqCreateUser): Promise<InsertResult> {
    const account = new DBAccountMysql();
    account.id = req.id;
    account.password = req.password;
    account.nickname = req.nickname;
    const db = await this.repository.createAccountMysqlAsync(account);
    return db;
  }

  async deleteAccountMysqlAsync(useridx: number): Promise<DeleteResult> {
    const db = await this.repository.deleteAccountMysqlAsync(useridx);
    return db;
  }
}
