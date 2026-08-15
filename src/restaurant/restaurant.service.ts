import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data,
      include: {
        cuisineType: true,
      },
    });
  }

  async findAll() {
    const restaurants = await this.prisma.restaurant.findMany({
      include: {
        cuisineType: true,
        visits: {
          orderBy: {
            visitedAt: 'desc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return restaurants.map((restaurant) => {
      const visitCount = restaurant.visits.length;

      const averageRating =
        visitCount > 0
          ? restaurant.visits.reduce((sum, visit) => sum + visit.rating, 0) /
            visitCount
          : null;

      const lastVisit = restaurant.visits[0] ?? null;

      return {
        ...restaurant,
        visited: visitCount > 0,
        visitCount,
        averageRating,
        lastVisitedAt: lastVisit?.visitedAt ?? null,
      };
    });
  }
}
