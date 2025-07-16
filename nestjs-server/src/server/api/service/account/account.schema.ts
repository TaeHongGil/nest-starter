import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ROLE } from '@root/core/define/define';
import { Expose } from 'class-transformer';

@Schema({
  collection: 'account',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class DBAccount {
  @Prop()
  @Expose()
  useridx: number;

  @Prop()
  @Expose()
  id: string;

  @Prop()
  @Expose()
  nickname: string;

  @Prop()
  @Expose()
  platform: string;

  @Prop({ type: 'number', enum: Object.values(ROLE) })
  @Expose()
  role: ROLE;

  @Prop()
  @Expose()
  created_at?: Date;

  @Prop()
  @Expose()
  updated_at?: Date;
}

export const DBAccountSchema = SchemaFactory.createForClass(DBAccount);

DBAccountSchema.index({ useridx: 1 }, { unique: true });
DBAccountSchema.index({ id: 1 }, { unique: true });
DBAccountSchema.index({ nickname: 1 }, { unique: true });
DBAccountSchema.index({ created_at: 1 });
