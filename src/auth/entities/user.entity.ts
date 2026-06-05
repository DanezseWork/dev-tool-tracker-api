import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Tool } from '../../tools/entities/tool.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @OneToMany(() => Tool, (tool) => tool.user)
  tools: Tool[];

  @CreateDateColumn()
  created_at: Date;
}
