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

  findAll() {
    return this.prisma.restaurant.findMany({
      include: {
        cuisineType: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
