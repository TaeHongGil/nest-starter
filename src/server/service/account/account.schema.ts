import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Mongo
 */
@Schema({
  collection: 'user_account',
  versionKey: false,
  _id: false,
})
export class DBAccount {
  @Prop() useridx: number;
  @Prop() id: string;
  @Prop() password: string;
  @Prop() nickname: string;
}

export const DBAccountSchema = SchemaFactory.createForClass<DBAccount>(DBAccount).index({ useridx: 1 }, { unique: true, name: 'idx_useridx' });
