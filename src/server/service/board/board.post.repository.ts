// board.repository.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { MongoService } from '@root/core/mongo/mongo.service';
import { MysqlService } from '@root/core/mysql/mysql.service';
import { RedisService } from '@root/core/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { DBPost, DBPostSchema } from './board.post.schema';

@Injectable()
export class PostRepository implements OnModuleInit {
  private model: Model<DBPost>;

  constructor(
    readonly mongo: MongoService,
    readonly mysql: MysqlService,
    readonly redis: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.model = this.mongo.getGlobalClient().model<DBPost>(DBPost.name, DBPostSchema);
    await this.model.createIndexes();
  }

  async findOne(filter: Partial<DBPost>, increaseViews = false): Promise<DBPost> {
    if (increaseViews) {
      await this.model.updateOne(filter, { $inc: { views: 1 } });
    }
    const result = await this.model.findOne(filter).lean();

    return result ? plainToInstance(DBPost, result, { excludeExtraneousValues: true }) : undefined;
  }

  async find(filter: Partial<DBPost>, page: number, limit: number): Promise<DBPost[]> {
    const result = await this.model
      .find(filter)
      .select('-content')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ postidx: -1 })
      .lean();

    return result ? plainToInstance(DBPost, result, { excludeExtraneousValues: true }) : undefined;
  }

  async count(filter: Partial<DBPost>): Promise<number> {
    const totalCount = await this.model.countDocuments(filter);

    return totalCount;
  }

  async delete(postidx: number): Promise<boolean> {
    const result = await this.model.deleteOne({ postidx });

    return result.deletedCount > 0;
  }

  async upsert(post: DBPost): Promise<DBPost> {
    const result = await this.model.findOneAndUpdate({ postidx: post.postidx }, post, { new: true, upsert: true }).lean();

    return result ? plainToInstance(DBPost, result, { excludeExtraneousValues: true }) : undefined;
  }

  async increaseidx(): Promise<number> {
    const client = this.redis.getGlobalClient();
    const postidx = await client.hIncrBy(CoreRedisKeys.getGlobalNumberKey(), 'postidx', 1);

    return postidx;
  }
}
