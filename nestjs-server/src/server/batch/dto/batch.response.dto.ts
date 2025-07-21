export class CronJobData {
  /**
   * Cron Job 이름
   */
  name: string;
  /**
   * Cron 표현식
   */
  cronTime: string;
  /**
   * 마지막 실행 시간
   */
  beforeDate: string;
  /**
   * 다음 실행 시간
   */
  nextDate: string;
  /**
   * 활성상태
   */
  active: boolean;
}

export class ResGetCronJobs {
  /**
   * Cron Job 목록
   */
  jobs: CronJobData[];
}

export class ResExecuteJob {
  /**
   * Cron Job 실행결과
   */
  result: boolean;

  /**
   * 실행 메시지
   */
  message?: string;
}

export class ResUpdateCronJobs extends ResGetCronJobs {}
