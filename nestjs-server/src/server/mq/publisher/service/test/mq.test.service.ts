import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { BULL_QUEUES } from '@root/server/mq/define/mq.define';
import { Queue } from 'bullmq';

@Injectable()
export class MQTestService {
  constructor(@InjectQueue(BULL_QUEUES.TEST) private readonly testQueue: Queue) {}

  async addTestData(data: any): Promise<void> {
    await this.testQueue.add(BULL_QUEUES.TEST, data);
  }
}
