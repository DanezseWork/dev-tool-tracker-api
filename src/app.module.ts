import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolsModule } from './tools/tools.module';
import { UsageLogsModule } from './usage-logs/usage-logs.module';
import { AuthModule } from './auth/auth.module';
import { Tool } from './tools/entities/tool.entity';
import { UsageLog } from './usage-logs/entities/usage-log.entity';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Tool, UsageLog],
        synchronize: config.get('NODE_ENV') !== 'production',
        ssl: config.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),
    AuthModule,
    ToolsModule,
    UsageLogsModule,
  ],
})
export class AppModule {}
