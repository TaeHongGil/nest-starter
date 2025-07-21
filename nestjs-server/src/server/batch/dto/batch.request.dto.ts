import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ReqStartCronJob {
  /**
   * Cron Job 이름
   */
  @IsString()
  @IsNotEmpty()
  name: string;
}

/**
 * Cron Job 주기/상태 수정 요청 DTO
 */
export class ReqUpdateCronJob {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cronTime: string;

  @IsBoolean()
  @IsNotEmpty()
  active: boolean;
}
