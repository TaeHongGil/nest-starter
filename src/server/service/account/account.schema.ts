import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Mongo
 */
@Schema({
  collection: 'user_account',
  versionKey: false,
})
export class DBAccount {
  @Prop()
  useridx: number;

  @Prop({ unique: true })
  id: string;

  @Prop({ unique: true })
  nickname: string;

  @Prop()
  password: string;
}
export const DBAccountSchema = SchemaFactory.createForClass<DBAccount>(DBAccount).index({ useridx: 1 }, { unique: true, name: 'idx_useridx' });

/**
 * Mysql
 */
@Entity({ name: 'user_account' })
export class DBAccountMysql {
  @PrimaryGeneratedColumn()
  useridx: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  id: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  nickname: string;
}
