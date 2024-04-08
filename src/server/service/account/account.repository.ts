import { Injectable } from '@nestjs/common';
import { MongoService } from '@root/core/mongo/mongo.service';
import { MysqlService } from '@root/core/mysql/mysql.service';
import { DeleteResult, InsertResult } from 'typeorm';
import { DBAccountMysql } from './account.entity';
import { DBAccount, DBAccountSchema } from './account.schema';

@Injectable()
export class AccountRepository {
  constructor(
    private readonly mongo: MongoService,
    private readonly mysql: MysqlService,
  ) {}

  /**
   * Mongo
   */
  async findAccountAsync(useridx: number): Promise<DBAccount> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.findOne({ useridx: useridx }).lean();
    if (!resultDoc) {
      return undefined;
    }
    return resultDoc;
  }

  async deleteAccountAsync(useridx: number): Promise<boolean> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.deleteOne({ useridx: useridx }).lean();
    if (!resultDoc) {
      return false;
    }
    return true;
  }

  async createAccountAsync(account: DBAccount): Promise<DBAccount> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.insertMany(account);
    if (!account) {
      return account;
    }
    return account;
  }

  /**
   * Mysql
   */
  async findAccountMysqlAsync(useridx: number): Promise<DBAccountMysql> {
    const repo = this.mysql.getGlobalClient().getRepository(DBAccountMysql);
    const options = {
      where: { useridx: useridx },
      skip: 0,
      order: {},
    };
    const result = await repo.findOne(options);
    return result;
  }

  async deleteAccountMysqlAsync(useridx: number): Promise<DeleteResult> {
    const repo = this.mysql.getGlobalClient().getRepository(DBAccountMysql);
    const result = await repo.delete({ useridx: useridx });

    return result;
  }

  async createAccountMysqlAsync(account: DBAccountMysql): Promise<InsertResult> {
    const repo = this.mysql.getGlobalClient().getRepository(DBAccountMysql);
    const result = await repo.insert(account);
    return result;
  }
}
