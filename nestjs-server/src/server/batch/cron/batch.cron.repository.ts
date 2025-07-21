import { Injectable } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import { RedisService } from '@root/core/redis/redis.service';
import { BeanUtils } from '@root/core/utils/bean.utils';
import { BatchRedisKeys } from '@root/server/batch/define/batch.redis.key';
import { DBCronJobInfo } from './batch.cron.schema';

@Injectable()
export class BatchCronRepository {
  constructor(private readonly redisService: RedisService) {}

  async getJobInfoAsync(name: string): Promise<DBCronJobInfo | null> {
    const client = this.redisService.getGlobalClient();
    const hashKey = BatchRedisKeys.getCronJobsKey();
    const data = await client.hGet(hashKey, name);
    let res: DBCronJobInfo = undefined;
    if (typeof data === 'string') {
      res = BeanUtils.ToIns(DBCronJobInfo, JSON.parse(data));
    } else {
      const info = new DBCronJobInfo();
      info.active = true;
      info.cronTime = CronExpression.EVERY_10_MINUTES;
      res = info;
    }

    return res;
  }

  async setJobInfoAsync(name: string, value: DBCronJobInfo): Promise<void> {
    const client = this.redisService.getGlobalClient();
    const hashKey = BatchRedisKeys.getCronJobsKey();
    await client.hSet(hashKey, name, JSON.stringify(value));
  }
}
