import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateUsageLogDto {
  @ApiProperty({ example: 'uuid-of-tool' })
  @IsString()
  tool_id: string;

  @ApiProperty({ example: 72, description: 'Current usage as percentage (0–100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  usage_percent: number;

  @ApiPropertyOptional({ example: 72, description: 'Raw count used (optional)' })
  @IsOptional()
  @IsInt()
  absolute_used?: number;

  @ApiPropertyOptional({ example: 'Heavy usage this week' })
  @IsOptional()
  @IsString()
  note?: string;
}
