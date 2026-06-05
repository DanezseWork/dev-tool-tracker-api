import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@ApiTags('tools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new tool' })
  create(@Request() req, @Body() dto: CreateToolDto) {
    return this.toolsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List your tools' })
  findAll(@Request() req) {
    return this.toolsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single tool' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.toolsService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tool' })
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateToolDto) {
    return this.toolsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tool' })
  remove(@Request() req, @Param('id') id: string) {
    return this.toolsService.remove(id, req.user.id);
  }
}
