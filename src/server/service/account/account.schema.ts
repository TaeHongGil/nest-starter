import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'user_account',
  versionKey: false,
})
export class DBAccount {
  @Prop({ unique: true })
  useridx: number;

  @Prop({ unique: true })
  id: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ unique: true })
  nickname: string;

  @Prop()
  password: string;

  @Prop()
  platform: string;

  @Prop()
  create_date: Date;
}

export const DBAccountSchema = SchemaFactory.createForClass<DBAccount>(DBAccount)
  .index({ useridx: 1 }, { unique: true, name: 'idx_useridx' })
  .index({ id: 1 }, { unique: true, name: 'idx_id' })
  .index({ email: 1 }, { unique: true, name: 'idx_email' })
  .index({ nickname: 1 }, { unique: true, name: 'idx_nickname' });
