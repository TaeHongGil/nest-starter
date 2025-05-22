import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BullMQService {
  constructor(@InjectQueue('test') private readonly testQueue: Queue) {}

  async addTestData(data: any): Promise<void> {
    await this.testQueue.add('test', data);
  }
}
