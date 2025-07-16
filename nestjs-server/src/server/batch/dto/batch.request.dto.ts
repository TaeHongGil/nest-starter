import { IsNotEmpty, IsString } from 'class-validator';

export class ReqStartCronJob {
  /**
   * Cron Job 이름
   */
  @IsString()
  @IsNotEmpty()
  name: string;
}
