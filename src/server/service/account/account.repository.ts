import { Injectable } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { CoreDefine } from '@root/core/define/define';
import { MongoService } from '@root/core/mongo/mongo.service';
import { MysqlService } from '@root/core/mysql/mysql.service';
import { RedisService } from '@root/core/redis/redis.service';
import { ServerRedisKeys } from '@root/server/define/server.redis.key';
import { DBAccount, DBAccountSchema } from './account.schema';
@Injectable()
export class AccountRepository {
  constructor(
    readonly mongo: MongoService,
    readonly mysql: MysqlService,
    readonly redis: RedisService,
  ) {}

  async findAccountByUseridxAsync(useridx: number): Promise<DBAccount> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.findOne({ useridx: useridx }).select('-_id').lean();
    if (!resultDoc) {
      return undefined;
    }

    return resultDoc;
  }

  async findAccountByIdAsync(id: string): Promise<DBAccount> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.findOne({ id: id }).select('-_id').lean();
    if (!resultDoc) {
      return undefined;
    }

    return resultDoc;
  }

  async findAccountByEmailAsync(email: string): Promise<DBAccount> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.findOne({ email: email }).select('-_id').lean();
    if (!resultDoc) {
      return undefined;
    }

    return resultDoc;
  }

  async findAccountByNicknameAsync(nickname: string): Promise<DBAccount> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.findOne({ nickname: nickname }).select('-_id').lean();
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

  async upsertAccountAsync(account: DBAccount): Promise<DBAccount> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const result = await model.findOneAndUpdate({ useridx: account.useridx }, account, { new: true, upsert: true }).lean();
    if (!result) {
      return undefined;
    }

    return result;
  }

  async increaseUseridx(): Promise<number> {
    const client = this.redis.getGlobalClient();
    const useridx = await client.hIncrBy(CoreRedisKeys.getGlobalNumberKey(), 'useridx', 1);

    return useridx;
  }

  async setLoginStateAsync(account: DBAccount): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    const accountWithLoginDate = {
      useridx: account.useridx,
      nickname: account.nickname,
      login_date: new Date().toISOString(),
    };
    await client.set(ServerRedisKeys.getUserStateKey(account.useridx), JSON.stringify(accountWithLoginDate), { EX: CoreDefine.LOGIN_STATE_EXPIRE_SECS });

    return true;
  }

  async deleteLoginStateAsync(useridx: number): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    await client.del(ServerRedisKeys.getUserStateKey(useridx));

    return true;
  }

  async refreshLoginStateAsync(useridx: number): Promise<boolean> {
    const client = this.redis.getGlobalClient();

    return await client.expire(ServerRedisKeys.getUserStateKey(useridx), CoreDefine.LOGIN_STATE_EXPIRE_SECS);
  }

  async setEmailVerificationAsync(account: DBAccount): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    const accountWithLoginDate = {
      useridx: account.useridx,
      nickname: account.nickname,
      login_date: new Date().toISOString(),
    };
    await client.set(ServerRedisKeys.getUserStateKey(account.useridx), JSON.stringify(accountWithLoginDate), { EX: CoreDefine.LOGIN_STATE_EXPIRE_SECS });

    return true;
  }
}
