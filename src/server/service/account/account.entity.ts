import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
