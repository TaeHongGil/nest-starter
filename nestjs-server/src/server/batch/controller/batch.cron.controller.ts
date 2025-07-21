import { Body, Controller, Get, Post, Session } from '@nestjs/common';
import { SessionData } from '@root/core/auth/auth.schema';
import { RoleGuard } from '@root/core/decorator/common.decorator';
import { ROLE } from '@root/core/define/define';
import ObjectUtil from '@root/core/utils/obj.utils';
import { BatchCronService } from '@root/server/batch/cron/batch.cron.service';
import { ReqStartCronJob as ReqExctueCronJob, ReqUpdateCronJob } from '@root/server/batch/dto/batch.request.dto';
import { ResExecuteJob, ResGetCronJobs, ResUpdateCronJobs } from '@root/server/batch/dto/batch.response.dto';
import BatchError from '@root/server/batch/error/batch.error';

@Controller('cron')
@RoleGuard(ROLE.ADMIN)
export class CronController {
  constructor(private cronService: BatchCronService) {}

  /**
   * Cron 작업 목록
   */
  @Get('/jobs')
  async getJobs(@Session() session: SessionData): Promise<ResGetCronJobs> {
    const jobsObj = this.cronService.getJobs();

    return { jobs: jobsObj };
  }

  /**
   * Cron 실행
   */
  @Post('/execute')
  async executeJob(@Session() session: SessionData, @Body() req: ReqExctueCronJob): Promise<ResExecuteJob> {
    try {
      await this.cronService.executeJobAsync(req.name);

      return { result: true, message: `Job ${req.name} executed successfully.` };
    } catch (error) {
      throw BatchError.CRON_EXECUTE_FAILED(error.message);
    }
  }

  /**
   * Cron 주기/상태 수정
   */
  @Post('/update')
  async updateDataSyncCronJob(@Body() req: ReqUpdateCronJob): Promise<ResUpdateCronJobs> {
    if (!ObjectUtil.isCronTime(req.cronTime)) {
      throw BatchError.CRON_UPDATE_FAILED('invalid cronTime');
    }

    await this.cronService.updateJobAsync(req.name, req.cronTime, req.active);
    const jobsObj = this.cronService.getJobs();

    return { jobs: jobsObj };
  }
}
