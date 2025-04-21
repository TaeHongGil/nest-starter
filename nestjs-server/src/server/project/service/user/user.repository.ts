import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoService } from '@root/core/mongo/mongo.service';
import { RedisService } from '@root/core/redis/redis.service';
import { Model } from 'mongoose';
import { DBUser, DBUserSchema } from './user.schema';
@Injectable()
export class UserRepository implements OnModuleInit {
  private model: Model<DBUser>;

  constructor(readonly redis: RedisService) {}

  async onModuleInit(): Promise<void> {
    this.model = MongoService.getGlobalClient().model<DBUser>(DBUser.name, DBUserSchema);
    await this.model.syncIndexes();
  }
}
