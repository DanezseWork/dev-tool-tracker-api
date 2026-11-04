import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolsModule } from './tools/tools.module';
import { UsageLogsModule } from './usage-logs/usage-logs.module';
import { AuthModule } from './auth/auth.module';
import { Tool } from './tools/entities/tool.entity';
import { UsageLog } from './usage-logs/entities/usage-log.entity';
import { User } from './auth/entities/user.entity';
import { postgresSsl, runtimeDatabaseUrl } from './database/postgres';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => {
        const url = runtimeDatabaseUrl();
        return {
          type: 'postgres' as const,
          url,
          entities: [User, Tool, UsageLog],
          synchronize: false,
          ssl: postgresSsl(url),
        };
      },
    }),
    AuthModule,
    ToolsModule,
    UsageLogsModule,
  ],
})
export class AppModule {}
