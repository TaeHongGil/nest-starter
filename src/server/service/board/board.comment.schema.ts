import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';

@Schema({
  collection: 'comments',
  versionKey: false,
  timestamps: { updatedAt: 'updated_at' },
})
export class DBComment {
  @Prop()
  @Expose()
  postidx: number;

  @Prop({ unique: true })
  @Expose()
  commentidx: number;

  @Prop()
  @Expose()
  path: string;

  @Prop({ index: true })
  @Expose()
  useridx: number;

  @Prop()
  @Expose()
  author: string;

  @Prop()
  @Expose()
  content: string;

  @Prop()
  @Expose()
  is_deleted: boolean;

  @Prop()
  @Expose()
  updated_at?: Date;
}

export const DBCommentSchema = SchemaFactory.createForClass(DBComment).index(
  {
    postidx: 1,
    path: 1,
  },
  { unique: true },
);
