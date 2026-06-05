import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './auth/entities/user.entity';
import { Tool } from './tools/entities/tool.entity';
import { UsageLog } from './usage-logs/entities/usage-log.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Tool, UsageLog],
  migrations: ['src/migrations/*.ts'],
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  synchronize: false,
});
