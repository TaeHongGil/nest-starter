import { Injectable } from '@nestjs/common';
import { ReqCreateUser } from '@root/server/common/server.dto';
import { AccountRepository } from './account.repository';
import { DBAccount } from './account.schema';

@Injectable()
export class AccountService {
  constructor(private readonly repository: AccountRepository) {}

  async getAccountAsync(useridx: number): Promise<DBAccount> {
    const db = this.repository.getAccountAsync(useridx);
    return db;
  }

  async upsertAccountAsync(req: ReqCreateUser): Promise<DBAccount> {
    const account: DBAccount = {
      useridx: 0,
      id: req.id,
      password: req.password,
      nickname: req.nickname,
    };
    const db = await this.repository.upsertAccountAsync(account);
    return db;
  }

  async deleteAccountAsync(useridx: number): Promise<boolean> {
    const db = await this.repository.deleteAccountAsync(useridx);
    return db;
  }
}
