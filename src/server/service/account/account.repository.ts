import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MongoService } from '@root/core/mongo/mongo.service';
import { MysqlService } from '@root/core/mysql/mysql.service';
import { RedisService } from '@root/core/redis/redis.service';
import { RedisKeys } from '@root/server/define/redis.key';
import { plainToInstance } from 'class-transformer';
import AutoIncrement from 'mongoose-sequence';
import { DeleteResult, InsertResult } from 'typeorm';
import { Account, DBAccount, DBAccountMysql, DBAccountSchema } from './account.schema';
@Injectable()
export class AccountRepository implements OnApplicationBootstrap {
  constructor(
    readonly mongo: MongoService,
    readonly mysql: MysqlService,
    readonly redis: RedisService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const con = this.mongo.getGlobalClient();
    const plugin = AutoIncrement(con);
    DBAccountSchema.plugin(plugin, { inc_field: 'useridx', id: 'account_useridx' });
  }

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
    return plainToInstance(DBAccount, resultDoc);
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
    await model.create(account);
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

  async setLoginStateAsync(account: Account): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    const accountWithLoginDate = {
      ...account,
      login_date: new Date().toISOString(),
    };
    await client.hSet(RedisKeys.getUserStateKey(), account.useridx.toString(), JSON.stringify(accountWithLoginDate));
    return true;
  }
}
