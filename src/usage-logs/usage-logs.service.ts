import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageLog } from './entities/usage-log.entity';
import { Tool } from '../tools/entities/tool.entity';
import { CreateUsageLogDto } from './dto/create-usage-log.dto';

@Injectable()
export class UsageLogsService {
  constructor(
    @InjectRepository(UsageLog)
    private readonly logRepo: Repository<UsageLog>,
    @InjectRepository(Tool)
    private readonly toolRepo: Repository<Tool>,
  ) {}

  private async assertOwnership(toolId: string, userId: string): Promise<Tool> {
    const tool = await this.toolRepo.findOne({ where: { id: toolId } });
    if (!tool) throw new NotFoundException(`Tool ${toolId} not found`);
    if (tool.user_id !== userId) throw new NotFoundException(`Tool ${toolId} not found`);
    return tool;
  }

  async create(userId: string, dto: CreateUsageLogDto): Promise<UsageLog> {
    const tool = await this.assertOwnership(dto.tool_id, userId);
    if (!tool.is_active) throw new BadRequestException(`Tool "${tool.name}" is not active`);

    const log = this.logRepo.create(dto);
    return this.logRepo.save(log);
  }

  async findByTool(toolId: string, userId: string): Promise<UsageLog[]> {
    await this.assertOwnership(toolId, userId);
    return this.logRepo.find({
      where: { tool_id: toolId },
      order: { logged_at: 'DESC' },
    });
  }

  async getLatestByTool(toolId: string, userId: string): Promise<UsageLog | null> {
    await this.assertOwnership(toolId, userId);
    return this.logRepo.findOne({
      where: { tool_id: toolId },
      order: { logged_at: 'DESC' },
    });
  }

  async getPace(toolId: string, userId: string) {
    const tool = await this.assertOwnership(toolId, userId);

    const latest = await this.logRepo.findOne({
      where: { tool_id: toolId },
      order: { logged_at: 'DESC' },
    });

    const current_percent = latest?.usage_percent ?? 0;
    const remaining_percent = 100 - current_percent;

    const today = new Date();
    const resetDay = tool.billing_reset_day ?? 1;
    const nextReset =
      today.getDate() >= resetDay
        ? new Date(today.getFullYear(), today.getMonth() + 1, resetDay)
        : new Date(today.getFullYear(), today.getMonth(), resetDay);

    const msPerDay = 1000 * 60 * 60 * 24;
    const days_remaining = Math.max(1, Math.ceil((nextReset.getTime() - today.getTime()) / msPerDay));
    const recommended_daily_pace = parseFloat((remaining_percent / days_remaining).toFixed(2));

    const cycle_days = tool.billing_cycle === 'annual' ? 365 : 30;
    const ideal_used = 100 - (days_remaining / cycle_days) * 100;
    const on_track = current_percent <= ideal_used + 5;

    return {
      tool_name: tool.name,
      current_percent,
      remaining_percent,
      days_remaining,
      recommended_daily_pace,
      on_track,
    };
  }
}
