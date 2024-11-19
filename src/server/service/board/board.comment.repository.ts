// board.repository.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CoreRedisKeys } from '@root/core/define/core.redis.key';
import { MongoService } from '@root/core/mongo/mongo.service';
import { MysqlService } from '@root/core/mysql/mysql.service';
import { RedisService } from '@root/core/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { DBComment, DBCommentSchema } from './board.comment.schema';

@Injectable()
export class CommentRepository implements OnModuleInit {
  private model: Model<DBComment>;

  constructor(
    readonly mongo: MongoService,
    readonly mysql: MysqlService,
    readonly redis: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.model = this.mongo.getGlobalClient().model<DBComment>(DBComment.name, DBCommentSchema);
    await this.model.createIndexes();
  }

  async findOne(filter: Partial<DBComment>): Promise<DBComment> {
    const result = await this.model.findOne(filter).lean();

    return result ? plainToInstance(DBComment, result, { excludeExtraneousValues: true }) : undefined;
  }

  async find(filter: Partial<DBComment>, page: number, limit: number): Promise<DBComment[]> {
    const result = await this.model
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ path: 1 })
      .lean();

    return result ? plainToInstance(DBComment, result, { excludeExtraneousValues: true }) : undefined;
  }

  async count(filter: Partial<DBComment>): Promise<number> {
    const totalCount = await this.model.countDocuments(filter);

    return totalCount;
  }

  async deleteMany(postidx: number): Promise<boolean> {
    const result = await this.model.deleteMany({ postidx });

    return result?.deletedCount > 0;
  }

  async deleteOne(commentidx: number): Promise<boolean> {
    const result = await this.model.deleteOne({ commentidx });

    return result?.deletedCount > 0;
  }

  async upsert(comment: DBComment): Promise<DBComment> {
    const result = await this.model.findOneAndUpdate({ commentidx: comment.commentidx }, comment, { new: true, upsert: true }).lean();

    return result ? plainToInstance(DBComment, result, { excludeExtraneousValues: true }) : undefined;
  }

  async increaseidx(): Promise<number> {
    const client = this.redis.getGlobalClient();
    const commentidx = await client.hIncrBy(CoreRedisKeys.getGlobalNumberKey(), 'commentidx', 1);

    return commentidx;
  }
}
