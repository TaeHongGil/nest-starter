import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoService } from '@root/core/mongo/mongo.service';
import { RedisService } from '@root/core/redis/redis.service';
import { Model } from 'mongoose';
import { DBUser, DBUserSchema } from './user.schema';
@Injectable()
export class UserRepository implements OnModuleInit {
  private model: Model<DBUser>;

  constructor(
    readonly redis: RedisService,
    readonly mongo: MongoService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.model = this.mongo.getGlobalClient().model<DBUser>(DBUser.name, DBUserSchema);
    await this.model.syncIndexes();
  }
}
