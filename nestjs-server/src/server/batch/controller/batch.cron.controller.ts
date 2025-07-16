import { Body, Controller, Get, Post, Session } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SessionData } from '@root/core/auth/auth.schema';
import { ReqStartCronJob as ReqExctueCronJob } from '@root/server/batch/dto/batch.request.dto';
import { ResExecuteJob, ResGetCronJobs } from '@root/server/batch/dto/batch.response.dto';
import BatchError from '@root/server/batch/error/batch.error';

/**
 * 인증 컨트롤러
 */
@Controller('cron')
export class CronController {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  /**
   * Cron 작업 목록
   */
  @Get('/jobs')
  async getJobs(@Session() session: SessionData): Promise<ResGetCronJobs> {
    const jobs = this.schedulerRegistry.getCronJobs();

    const jobsObj = Array.from(jobs.entries()).map(([name, job]) => ({
      name,
      cronTime: job.cronTime.source.toString(),
      beforeDate: job.lastDate() ? job.lastDate().toISOString() : null,
      nextDate: job.nextDate().toJSDate().toISOString(),
    }));

    return { jobs: jobsObj };
  }

  /**
   * Cron 실행
   */
  @Post('/execute')
  async executeJob(@Session() session: SessionData, @Body() req: ReqExctueCronJob): Promise<ResExecuteJob> {
    try {
      const job = this.schedulerRegistry.getCronJob(req.name);
      await job.fireOnTick();

      return { result: true, message: `Job ${req.name} executed successfully.` };
    } catch (error) {
      throw BatchError.CRON_EXECUTE_FAILED(error.message);
    }
  }
}
