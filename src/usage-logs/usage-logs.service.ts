import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageLog } from './entities/usage-log.entity';
import { Tool } from '../tools/entities/tool.entity';
import { CycleType } from '../tools/enums/cycle-type.enum';
import { CreateUsageLogDto } from './dto/create-usage-log.dto';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Parses a "HH:MM" or "HH:MM:SS" time string into [hours, minutes, seconds].
 * Returns [0, 0, 0] when timeStr is null (midnight UTC default).
 */
function parseTimeStr(timeStr: string | null): [number, number, number] {
  if (!timeStr) return [0, 0, 0];
  const parts = timeStr.split(':').map(Number);
  return [parts[0], parts[1] ?? 0, parts[2] ?? 0];
}

/**
 * Builds a UTC Date from a calendar date (year/month/day in UTC) and an optional
 * HH:MM[:SS] time string. Month is 0-indexed (JavaScript convention).
 */
function buildUtcTimestamp(
  year: number,
  month: number,
  day: number,
  timeStr: string | null,
): Date {
  const [h, m, s] = parseTimeStr(timeStr);
  return new Date(Date.UTC(year, month, day, h, m, s));
}

/**
 * Parses a date-only string like "2026-06-01" into UTC year/month/day components.
 * Using explicit UTC parsing avoids local-timezone shifts when constructing timestamps.
 */
function parseDateStr(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month: month - 1, day }; // month is 0-indexed for Date.UTC
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface PaceResult {
  tool_name: string;
  current_percent: number;
  remaining_percent: number;
  days_elapsed: number;
  days_remaining: number;
  recommended_daily_pace: number;
  on_track: boolean;
  reset_time_assumed: boolean;
}

function computePaceForMonthly(tool: Tool, currentPercent: number): PaceResult {
  const now = new Date();
  const resetDay = tool.billing_reset_day ?? 1;
  const resetTime = tool.cycle_reset_time;
  const resetTimeAssumed = resetTime === null;

  // Build the reset timestamp for the current UTC month and adjacent months
  const y = now.getUTCFullYear();
  const mo = now.getUTCMonth();

  const thisMonthReset = buildUtcTimestamp(y, mo, resetDay, resetTime);

  let cycleStart: Date;
  let nextReset: Date;

  if (now >= thisMonthReset) {
    cycleStart = thisMonthReset;
    nextReset = buildUtcTimestamp(y, mo + 1, resetDay, resetTime);
  } else {
    cycleStart = buildUtcTimestamp(y, mo - 1, resetDay, resetTime);
    nextReset = thisMonthReset;
  }

  const totalMs = nextReset.getTime() - cycleStart.getTime();
  const elapsedMs = now.getTime() - cycleStart.getTime();
  const totalDays = totalMs / MS_PER_DAY;

  const daysElapsed = round2(Math.min(Math.max(0, elapsedMs / MS_PER_DAY), totalDays));
  const daysRemaining = round2(Math.max(0, totalDays - daysElapsed));

  const remainingPercent = round2(100 - currentPercent);
  const recommendedDailyPace =
    daysRemaining === 0 ? remainingPercent : round2(remainingPercent / daysRemaining);

  const idealUsedPercent = (daysElapsed / totalDays) * 100;
  const onTrack = currentPercent <= idealUsedPercent;

  return {
    tool_name: tool.name,
    current_percent: currentPercent,
    remaining_percent: remainingPercent,
    days_elapsed: daysElapsed,
    days_remaining: daysRemaining,
    recommended_daily_pace: recommendedDailyPace,
    on_track: onTrack,
    reset_time_assumed: resetTimeAssumed,
  };
}

function computePaceForAnchoredCycle(
  tool: Tool,
  currentPercent: number,
  totalDays: number,
): PaceResult {
  if (!tool.cycle_start_date) {
    throw new BadRequestException(
      `Tool "${tool.name}" requires cycle_start_date for ${tool.cycle_type} cycle type`,
    );
  }

  const now = new Date();
  const resetTime = tool.cycle_reset_time;
  const resetTimeAssumed = resetTime === null;

  const { year, month, day } = parseDateStr(tool.cycle_start_date);
  const cycleStart = buildUtcTimestamp(year, month, day, resetTime);

  const elapsedMs = now.getTime() - cycleStart.getTime();
  const totalMs = totalDays * MS_PER_DAY;

  const daysElapsed = round2(Math.min(Math.max(0, elapsedMs / MS_PER_DAY), totalDays));
  const daysRemaining = round2(Math.max(0, totalDays - daysElapsed));

  const remainingPercent = round2(100 - currentPercent);
  const recommendedDailyPace =
    daysRemaining === 0 ? remainingPercent : round2(remainingPercent / daysRemaining);

  const idealUsedPercent = (daysElapsed / totalDays) * 100;
  const onTrack = currentPercent <= idealUsedPercent;

  return {
    tool_name: tool.name,
    current_percent: currentPercent,
    remaining_percent: remainingPercent,
    days_elapsed: daysElapsed,
    days_remaining: daysRemaining,
    recommended_daily_pace: recommendedDailyPace,
    on_track: onTrack,
    reset_time_assumed: resetTimeAssumed,
  };
}

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

  async getPace(toolId: string, userId: string): Promise<PaceResult> {
    const tool = await this.assertOwnership(toolId, userId);

    const latest = await this.logRepo.findOne({
      where: { tool_id: toolId },
      order: { logged_at: 'DESC' },
    });

    const currentPercent = latest?.usage_percent ?? 0;
    const cycleType = tool.cycle_type ?? CycleType.MONTHLY;

    switch (cycleType) {
      case CycleType.WEEKLY:
        return computePaceForAnchoredCycle(tool, currentPercent, 7);

      case CycleType.CUSTOM: {
        if (!tool.cycle_length_days) {
          throw new BadRequestException(
            `Tool "${tool.name}" requires cycle_length_days for custom cycle type`,
          );
        }
        return computePaceForAnchoredCycle(tool, currentPercent, tool.cycle_length_days);
      }

      case CycleType.MONTHLY:
      default:
        return computePaceForMonthly(tool, currentPercent);
    }
  }
}
