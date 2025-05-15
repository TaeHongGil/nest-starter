import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '@root/core/redis/redis.service';
@Injectable()
export class ChatRepository implements OnModuleInit {
  constructor(readonly redis: RedisService) {}

  async onModuleInit(): Promise<void> {}
}
