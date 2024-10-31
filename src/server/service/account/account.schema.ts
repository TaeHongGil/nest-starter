import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'user_account',
  versionKey: false,
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
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
  verification: number;

  @Prop()
  created_at?: Date;

  @Prop()
  updated_at?: Date;

  @Prop()
  expires_at?: Date;
}

export const DBAccountSchema = SchemaFactory.createForClass(DBAccount).index({ expires_at: 1 }, { expireAfterSeconds: 0 });
