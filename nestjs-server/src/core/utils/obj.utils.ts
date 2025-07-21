import { CronTime } from 'cron';

class ObjectUtil {
  static isCronTime(cronTime: string): boolean {
    try {
      new CronTime(cronTime);

      return true;
    } catch {
      return false;
    }
  }
}

export default ObjectUtil;
