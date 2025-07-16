import { Injectable } from '@nestjs/common';
import { RedisService } from '@root/core/redis/redis.service';
import { SHEET_ID } from '@root/server/batch/define/batch.define';
import { BatchRedisKeys } from '@root/server/batch/define/batch.redis.key';

@Injectable()
export class BatchGoogleRepository {
  constructor(private readonly redis: RedisService) {}

  async setModifiedTimeAsync(id: SHEET_ID, modifiedTime: string): Promise<boolean> {
    const client = this.redis.getGlobalClient();
    const key = BatchRedisKeys.getSheetKey(id);
    await client.set(key, modifiedTime);

    return true;
  }

  async getModifiedTimeAsync(id: SHEET_ID): Promise<string | undefined> {
    const client = this.redis.getGlobalClient();
    const key = BatchRedisKeys.getSheetKey(id);
    const modifiedTime = await client.get(key);

    return typeof modifiedTime === 'string' ? modifiedTime : undefined;
  }
}
