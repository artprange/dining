import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuisineTypeDto } from './dto/create-cuisine-type.dto';
import { UpdateCuisineTypeDto } from './dto/update-cuisine-type.dto';

@Injectable()
export class CuisineTypeService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCuisineTypeDto) {
    return this.prisma.cuisineType.create({ data });
  }

  findAll() {
    return this.prisma.cuisineType.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { restaurants: true } } },
    });
  }

  async findOne(id: string) {
    const cuisineType = await this.prisma.cuisineType.findUnique({
      where: { id },
      include: { _count: { select: { restaurants: true } } },
    });

    if (!cuisineType) {
      throw new NotFoundException(`Tipo de culinaria ${id} nao encontrado.`);
    }

    return cuisineType;
  }

  async update(id: string, data: UpdateCuisineTypeDto) {
    await this.findOne(id);

    return this.prisma.cuisineType.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.cuisineType.delete({ where: { id } });
  }
}
