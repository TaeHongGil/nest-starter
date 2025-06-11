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
    const key = ApiRedisKeys.getUserStateKey();

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
    const key = ApiRedisKeys.getUserStateKey();
    const result = await client.hDel(key, useridx.toString());

    return result > 0;
  }
}
