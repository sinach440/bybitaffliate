import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('verified_users')
export class VerifiedUser {
  @PrimaryGeneratedColumn()
  id: number;

  /** Bybit UID – unique so we don't store or send VIP link twice. */
  @Column({ type: 'varchar', length: 32, unique: true })
  @Index('IDX_verified_users_uid', { unique: true })
  uid: string;

  /** Telegram user id who submitted this UID (for audit). */
  @Column({ type: 'varchar', length: 32, nullable: true })
  telegramId: string | null;

  @CreateDateColumn({ name: 'verified_at' })
  verifiedAt: Date;
}
