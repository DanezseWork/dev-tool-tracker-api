import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageLog } from './entities/usage-log.entity';
import { Tool } from '../tools/entities/tool.entity';
import { UsageLogsService } from './usage-logs.service';
import { UsageLogsController } from './usage-logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsageLog, Tool])],
  controllers: [UsageLogsController],
  providers: [UsageLogsService],
})
export class UsageLogsModule {}
