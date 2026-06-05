import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { BillingCycle } from '../entities/tool.entity';

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

  @ApiPropertyOptional({ example: 1, description: 'Day of month billing resets' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  billing_reset_day?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
