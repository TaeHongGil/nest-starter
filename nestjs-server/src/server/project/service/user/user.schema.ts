import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';

@Schema({
  collection: 'user',
  versionKey: false,
  timestamps: { updatedAt: 'updated_at' },
})
export class DBUser {
  @Prop()
  @Expose()
  updated_at?: Date;
}

export const DBUserSchema = SchemaFactory.createForClass(DBUser);
