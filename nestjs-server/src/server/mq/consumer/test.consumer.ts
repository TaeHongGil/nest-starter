import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('test')
@Injectable()
export class TestConsumer extends WorkerHost {
  async process(job: Job): Promise<any> {
    console.log('test consumer', job.data);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
