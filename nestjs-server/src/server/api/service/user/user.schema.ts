import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  collection: 'user',
  versionKey: false,
  timestamps: { updatedAt: 'updated_at' },
})
export class DBUser {
  @Prop()
  updated_at?: Date;
}

export const DBUserSchema = SchemaFactory.createForClass(DBUser);
