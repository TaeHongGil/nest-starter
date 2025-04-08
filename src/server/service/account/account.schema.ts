import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ROLE } from '@root/core/define/define';
import { Expose } from 'class-transformer';

@Schema({
  collection: 'user_account',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class DBAccount {
  @Prop({ unique: true })
  @Expose()
  useridx: number;

  @Prop({ unique: true })
  @Expose()
  id: string;

  @Prop({ unique: true })
  @Expose()
  nickname: string;

  @Prop()
  @Expose()
  platform: string;

  @Prop({ type: 'string', enum: Object.values(ROLE), index: true })
  @Expose()
  role: ROLE;

  @Prop()
  @Expose()
  created_at?: Date;

  @Prop()
  @Expose()
  updated_at?: Date;

  @Prop()
  @Expose()
  expires_at?: Date;
}

export const DBAccountSchema = SchemaFactory.createForClass(DBAccount).index({ expires_at: 1 }, { expireAfterSeconds: 0 });
