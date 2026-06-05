import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsDefined,
  Matches,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { BillingCycle } from '../entities/tool.entity';
import { CycleType } from '../enums/cycle-type.enum';

export class CreateToolDto {
  @ApiProperty({ example: 'Claude Pro' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Anthropic AI assistant' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'AI' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  usage_limit?: number;

  @ApiPropertyOptional({ example: 'messages' })
  @IsOptional()
  @IsString()
  usage_unit?: string;

  @ApiPropertyOptional({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  @IsOptional()
  @IsEnum(BillingCycle)
  billing_cycle?: BillingCycle;

  @ApiPropertyOptional({
    example: 1,
    description: 'Day of month billing resets (1–31). Required when cycle_type is monthly.',
  })
  @ValidateIf((o: CreateToolDto) => (o.cycle_type ?? CycleType.MONTHLY) === CycleType.MONTHLY)
  @IsDefined({ message: 'billing_reset_day is required when cycle_type is monthly' })
  @IsInt()
  @Min(1)
  @Max(31)
  billing_reset_day?: number;

  @ApiPropertyOptional({ enum: CycleType, default: CycleType.MONTHLY })
  @IsOptional()
  @IsEnum(CycleType)
  cycle_type?: CycleType;

  @ApiPropertyOptional({
    example: 14,
    description: 'Cycle length in days. Required when cycle_type is custom.',
  })
  @ValidateIf((o: CreateToolDto) => o.cycle_type === CycleType.CUSTOM)
  @IsDefined({ message: 'cycle_length_days is required when cycle_type is custom' })
  @IsInt()
  @Min(1)
  cycle_length_days?: number;

  @ApiPropertyOptional({
    example: '2026-06-01',
    description:
      'Anchor date for the current cycle (ISO date string). Required when cycle_type is weekly or custom.',
  })
  @ValidateIf(
    (o: CreateToolDto) =>
      o.cycle_type === CycleType.WEEKLY || o.cycle_type === CycleType.CUSTOM,
  )
  @IsDefined({ message: 'cycle_start_date is required when cycle_type is weekly or custom' })
  @IsDateString()
  cycle_start_date?: string;

  @ApiPropertyOptional({
    example: '09:00',
    description:
      'Time of day (UTC) at which the billing cycle resets, in HH:MM or HH:MM:SS format. ' +
      'If omitted, midnight UTC (00:00:00) is assumed. ' +
      'IMPORTANT: most AI tools do NOT reset at midnight — check your provider\'s billing timezone ' +
      'and set this explicitly for accurate pace calculations. ' +
      'When null, the pace response will include reset_time_assumed: true so your client can warn the user.',
  })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'cycle_reset_time must be in HH:MM or HH:MM:SS format',
  })
  cycle_reset_time?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
