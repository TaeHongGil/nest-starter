import { Injectable, OnModuleInit } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { LOGIN_STATE } from '@root/core/define/define';
import { MongoService } from '@root/core/mongo/mongo.service';
import { RedisService } from '@root/core/redis/redis.service';
import { ServerRedisKeys } from '@root/server/define/server.redis.key';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { DBAccount, DBAccountSchema } from './account.schema';
@Injectable()
export class AccountRepository implements OnModuleInit {
  private model: Model<DBAccount>;

  constructor(readonly redis: RedisService) {}

  async onModuleInit(): Promise<void> {
    this.model = MongoService.getGlobalClient().model<DBAccount>(DBAccount.name, DBAccountSchema);
    await this.model.syncIndexes();
  }

  async findOne(filter: Partial<DBAccount>): Promise<DBAccount> {
    const session = MongoService.getCurrentSession();
    const result = await this.model.findOne(filter).select('-_id').session(session).lean();

    return plainToInstance(DBAccount, result) || undefined;
  }

  async delete(useridx: number): Promise<boolean> {
    const session = MongoService.getCurrentSession();
    const result = await this.model.deleteOne({ useridx }).session(session).lean();
    return result.deletedCount > 0;
  }

  async upsert(account: DBAccount): Promise<DBAccount> {
    const session = MongoService.getCurrentSession();
    await this.model.findOneAndUpdate({ useridx: account.useridx }, account, { new: true, upsert: true }).session(session).lean();
    return account;
  }

  async increaseidx(): Promise<number> {
    const client = this.redis.getGlobalClient();
    const useridx = await client.hIncrBy(CoreRedisKeys.getGlobalNumberKey(), 'useridx', 1);

    return useridx;
  }

  async setLoginState(account: DBAccount): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    const accountWithLoginDate = {
      useridx: account.useridx,
      nickname: account.nickname,
      login_date: new Date().toDateString(),
    };
    await client.set(ServerRedisKeys.getUserStateKey(account.useridx), JSON.stringify(accountWithLoginDate), { EX: LOGIN_STATE.EXPIRES_SEC });

    return true;
  }

  async deleteLoginState(useridx: number): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    await client.del(ServerRedisKeys.getUserStateKey(useridx));

    return true;
  }

  async refreshLoginState(useridx: number): Promise<boolean> {
    const client = this.redis.getGlobalClient();

    return await client.expire(ServerRedisKeys.getUserStateKey(useridx), LOGIN_STATE.EXPIRES_SEC);
  }
}
