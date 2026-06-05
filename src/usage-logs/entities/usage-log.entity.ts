import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tool } from '../../tools/entities/tool.entity';

@Entity('usage_logs')
export class UsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tool, (tool) => tool.usage_logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tool_id' })
  tool: Tool;

  @Column()
  tool_id: string;

  @Column({ type: 'int' })
  usage_percent: number; // 0–100, current usage snapshot

  @Column({ type: 'int', nullable: true })
  absolute_used: number; // optional: raw count (e.g. 42 messages)

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  logged_at: Date;
}
