import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';

@Injectable()
export class VisitService {
  constructor(private readonly prisma: PrismaService) {}

  create(restaurantId: string, data: CreateVisitDto) {
    return this.prisma.visit.create({
      data: {
        restaurantId,
        visitedAt: new Date(data.visitedAt),
        rating: data.rating,
        wouldReturn: data.wouldReturn,
        notes: data.notes,
      },
      include: {
        restaurant: {
          include: {
            cuisineType: true,
          },
        },
      },
    });
  }

  findAllByRestaurant(restaurantId: string) {
    return this.prisma.visit.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        visitedAt: 'desc',
      },
    });
  }
}
