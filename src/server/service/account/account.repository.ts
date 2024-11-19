import { Injectable, OnModuleInit } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { LOGIN_STATE } from '@root/core/define/define';
import { MongoService } from '@root/core/mongo/mongo.service';
import { MysqlService } from '@root/core/mysql/mysql.service';
import { RedisService } from '@root/core/redis/redis.service';
import { ServerRedisKeys } from '@root/server/define/server.redis.key';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { DBAccount, DBAccountSchema } from './account.schema';
@Injectable()
export class AccountRepository implements OnModuleInit {
  private model: Model<DBAccount>;

  constructor(
    readonly mongo: MongoService,
    readonly mysql: MysqlService,
    readonly redis: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.model = this.mongo.getGlobalClient().model<DBAccount>(DBAccount.name, DBAccountSchema);
    await this.model.createIndexes();
  }

  async findOne(filter: Partial<DBAccount>): Promise<DBAccount> {
    const result = await this.model.findOne(filter).select('-_id').lean();

    return plainToInstance(DBAccount, result) || undefined;
  }

  async delete(useridx: number): Promise<boolean> {
    const result = await this.model.deleteOne({ useridx }).lean();

    return result.deletedCount > 0;
  }

  /**
   *
   * @param account
   * @param ttl_msec 0일 경우 제거
   * @returns
   */
  async upsert(account: DBAccount, ttl_msec?: number): Promise<DBAccount> {
    const updateData: any = { ...account };
    const update: any = { $set: updateData };

    if (ttl_msec !== undefined) {
      if (ttl_msec > 0) {
        update.$set.expires_at = new Date(Date.now() + ttl_msec);
      } else {
        delete update.$set.expires_at;
        update.$unset = { expires_at: '' };
      }
    }
    await this.model.findOneAndUpdate({ useridx: account.useridx }, update, { new: true, upsert: true }).lean();

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
      login_date: new Date().toISOString(),
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
