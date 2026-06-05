import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsageLogsService } from './usage-logs.service';
import { CreateUsageLogDto } from './dto/create-usage-log.dto';

@ApiTags('usage-logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usage-logs')
export class UsageLogsController {
  constructor(private readonly usageLogsService: UsageLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Log current usage for a tool' })
  create(@Request() req, @Body() dto: CreateUsageLogDto) {
    return this.usageLogsService.create(req.user.id, dto);
  }

  @Get('tool/:toolId')
  @ApiOperation({ summary: 'Get all usage logs for a tool' })
  findByTool(@Request() req, @Param('toolId') toolId: string) {
    return this.usageLogsService.findByTool(toolId, req.user.id);
  }

  @Get('tool/:toolId/pace')
  @ApiOperation({ summary: 'Get recommended daily pace for a tool' })
  getPace(@Request() req, @Param('toolId') toolId: string) {
    return this.usageLogsService.getPace(toolId, req.user.id);
  }

  @Get('tool/:toolId/latest')
  @ApiOperation({ summary: 'Get latest usage snapshot' })
  getLatest(@Request() req, @Param('toolId') toolId: string) {
    return this.usageLogsService.getLatestByTool(toolId, req.user.id);
  }
}
