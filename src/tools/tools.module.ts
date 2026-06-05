import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tool } from './entities/tool.entity';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tool])],
  controllers: [ToolsController],
  providers: [ToolsService],
  exports: [TypeOrmModule],
})
export class ToolsModule {}
