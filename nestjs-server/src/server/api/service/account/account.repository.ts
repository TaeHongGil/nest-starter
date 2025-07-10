import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { LOGIN_STATE } from '@root/core/define/define';
import { RedisService } from '@root/core/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { ApiRedisKeys } from '../../define/api.redis.key';
import { DBAccount } from './account.schema';

@Injectable()
export class AccountRepository {
  constructor(
    private readonly redis: RedisService,
    @InjectModel(DBAccount.name) private readonly model: Model<DBAccount>,
  ) {}

  async findOne(filter: Partial<DBAccount>): Promise<DBAccount> {
    const result = await this.model.findOne(filter).lean();

    return plainToInstance(DBAccount, result, { excludeExtraneousValues: true });
  }

  async delete(useridx: number): Promise<boolean> {
    const result = await this.model.deleteOne({ useridx }).lean();

    return result.deletedCount > 0;
  }

  async upsert(account: DBAccount): Promise<DBAccount> {
    await this.model.findOneAndUpdate({ useridx: account.useridx }, account, { new: true, upsert: true }).lean();

    return account;
  }

  async increaseidx(): Promise<number> {
    const client = this.redis.getGlobalClient();

    return await client.hIncrBy(CoreRedisKeys.getGlobalNumberKey(), 'useridx', 1);
  }

  async setLoginStateAsync(useridx: number): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    const key = ApiRedisKeys.getUserStateKey(useridx);

    await client.set(key, new Date().toISOString());
    await client.expire(key, LOGIN_STATE.EXPIRES_SEC);

    return true;
  }

  async deleteLoginState(useridx: number): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    const key = ApiRedisKeys.getUserStateKey(useridx);
    const result = await client.del(key);

    return result > 0;
  }
}
