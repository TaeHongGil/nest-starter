import { Injectable, OnModuleInit } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { LOGIN_STATE } from '@root/core/define/define';
import { MongoService } from '@root/core/mongo/mongo.service';
import { RedisService } from '@root/core/redis/redis.service';
import { CommonRedisKeys } from '@root/server/common/define/common.redis.key';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { DBAccount, DBAccountSchema } from './account.schema';
@Injectable()
export class AccountRepository implements OnModuleInit {
  private model: Model<DBAccount>;

  constructor(private readonly redis: RedisService) {}

  async onModuleInit(): Promise<void> {
    this.model = MongoService.getGlobalClient().model<DBAccount>(DBAccount.name, DBAccountSchema);
    await this.model.syncIndexes();
  }

  async findOne(filter: Partial<DBAccount>): Promise<DBAccount> {
    const session = MongoService.getCurrentSession();
    const result = await this.model.findOne(filter).session(session).lean();

    return plainToInstance(DBAccount, result, { excludeExtraneousValues: true });
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

    return await client.hIncrBy(CoreRedisKeys.getGlobalNumberKey(), 'useridx', 1);
  }

  async setLoginStateAsync(useridx: number): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    const key = CommonRedisKeys.getUserStateKey();

    if (await client.hExists(key, useridx.toString())) {
      return await this.updateLoginStateTTL(client, key, useridx.toString(), 'XX');
    }

    await client.hSet(key, useridx.toString(), new Date().toISOString());

    return await this.updateLoginStateTTL(client, key, useridx.toString(), 'NX');
  }

  /**
   * 공통 TTL 업데이트 메서드
   */
  private async updateLoginStateTTL(client: any, key: string, field: string, condition: 'XX' | 'NX'): Promise<boolean> {
    const result = await client.hExpire(key, field, LOGIN_STATE.EXPIRES_SEC, condition);

    return result[0] === 1;
  }

  async deleteLoginState(useridx: number): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    const key = CommonRedisKeys.getUserStateKey();
    const result = await client.hDel(key, useridx.toString());

    return result > 0;
  }
}
