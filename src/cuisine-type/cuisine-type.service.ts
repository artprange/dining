import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuisineTypeDto } from './dto/create-cuisine-type.dto';

@Injectable()
export class CuisineTypeService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCuisineTypeDto) {
    return this.prisma.cuisineType.create({
      data,
    });
  }

  findAll() {
    return this.prisma.cuisineType.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}
