import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tool } from './entities/tool.entity';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@Injectable()
export class ToolsService {
  constructor(
    @InjectRepository(Tool)
    private readonly toolRepo: Repository<Tool>,
  ) {}

  async create(userId: string, dto: CreateToolDto): Promise<Tool> {
    const existing = await this.toolRepo.findOne({
      where: { name: dto.name, user_id: userId },
    });
    if (existing) throw new ConflictException(`Tool "${dto.name}" already exists`);

    const tool = this.toolRepo.create({ ...dto, user_id: userId });
    return this.toolRepo.save(tool);
  }

  findAll(userId: string): Promise<Tool[]> {
    return this.toolRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Tool> {
    const tool = await this.toolRepo.findOne({ where: { id } });
    if (!tool) throw new NotFoundException(`Tool ${id} not found`);
    if (tool.user_id !== userId) throw new ForbiddenException();
    return tool;
  }

  async update(id: string, userId: string, dto: UpdateToolDto): Promise<Tool> {
    const tool = await this.findOne(id, userId);
    Object.assign(tool, dto);
    return this.toolRepo.save(tool);
  }

  async remove(id: string, userId: string): Promise<void> {
    const tool = await this.findOne(id, userId);
    await this.toolRepo.remove(tool);
  }
}
