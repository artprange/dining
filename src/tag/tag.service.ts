import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTagDto) {
    return this.prisma.tag.create({ data });
  }

  findAll() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { restaurants: true } } },
    });
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { restaurants: true } } },
    });

    if (!tag) {
      throw new NotFoundException(`Tag ${id} nao encontrada.`);
    }

    return tag;
  }

  async update(id: string, data: UpdateTagDto) {
    await this.findOne(id);

    return this.prisma.tag.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.tag.delete({ where: { id } });
  }
}
