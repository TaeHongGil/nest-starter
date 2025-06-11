import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RedisService } from '@root/core/redis/redis.service';
import { Model } from 'mongoose';
import { DBUser } from './user.schema';
@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(DBUser.name) private readonly model: Model<DBUser>,
    readonly redis: RedisService,
  ) {}
}
