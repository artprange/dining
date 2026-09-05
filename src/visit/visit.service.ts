import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Injectable()
export class VisitService {
  constructor(private readonly prisma: PrismaService) {}

  async create(restaurantId: string, data: CreateVisitDto) {
    await this.ensureRestaurantExists(restaurantId);

    return this.prisma.visit.create({
      data: { ...data, restaurantId },
    });
  }

  async findAllByRestaurant(restaurantId: string) {
    await this.ensureRestaurantExists(restaurantId);

    return this.prisma.visit.findMany({
      where: { restaurantId },
      orderBy: { visitedAt: 'desc' },
    });
  }

  async findOne(restaurantId: string, id: string) {
    const visit = await this.prisma.visit.findFirst({
      where: { id, restaurantId },
    });

    if (!visit) {
      throw new NotFoundException(
        `Visita ${id} nao encontrada para o restaurante ${restaurantId}.`,
      );
    }

    return visit;
  }

  async update(restaurantId: string, id: string, data: UpdateVisitDto) {
    await this.findOne(restaurantId, id);

    return this.prisma.visit.update({ where: { id }, data });
  }

  async remove(restaurantId: string, id: string) {
    await this.findOne(restaurantId, id);

    await this.prisma.visit.delete({ where: { id } });
  }

  private async ensureRestaurantExists(restaurantId: string) {
    const exists = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(
        `Restaurante ${restaurantId} nao encontrado.`,
      );
    }
  }
}
