import { CoreRedisKeys } from '@root/core/define/core.redis.key';

export class BatchRedisKeys extends CoreRedisKeys {
  static getBatchPrefix(): string {
    return `${this.getPrefix()}:batch`;
  }

  static getCronJobsKey(): string {
    return `${this.getBatchPrefix()}:cron_jobs`;
  }
}
