import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';

@Schema({
  collection: 'posts',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class DBPost {
  @Prop({ unique: true, index: -1 })
  @Expose()
  postidx: number;

  @Prop({ index: true })
  @Expose()
  title: string;

  @Prop({ index: true })
  @Expose()
  content: string;

  @Prop({ index: true })
  @Expose()
  author: string;

  @Prop({ index: true })
  @Expose()
  useridx: number;

  @Prop({ default: 0 })
  @Expose()
  views: number;

  @Prop()
  created_at?: Date;

  @Prop()
  @Expose()
  updated_at?: Date;
}

export const DBPostSchema = SchemaFactory.createForClass(DBPost);
