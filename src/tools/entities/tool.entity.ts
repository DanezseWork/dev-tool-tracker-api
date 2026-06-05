import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UsageLog } from '../../usage-logs/entities/usage-log.entity';
import { User } from '../../auth/entities/user.entity';

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
  FREE = 'free',
}

@Entity('tools')
export class Tool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.tools, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'int', nullable: true })
  usage_limit: number;

  @Column({ nullable: true })
  usage_unit: string;

  @Column({ type: 'enum', enum: BillingCycle, default: BillingCycle.MONTHLY })
  billing_cycle: BillingCycle;

  @Column({ type: 'int', nullable: true })
  billing_reset_day: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => UsageLog, (log) => log.tool)
  usage_logs: UsageLog[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
