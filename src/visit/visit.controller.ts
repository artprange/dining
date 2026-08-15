import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { Visit } from '../generated/prisma/client';
import { CreateVisitDto } from './dto/create-visit.dto';
import { VisitService } from './visit.service';

@Controller('restaurants/:restaurantId/visits')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post()
  async create(
    @Param('restaurantId') restaurantId: string,
    @Body() data: CreateVisitDto,
  ): Promise<Visit> {
    return await this.visitService.create(restaurantId, data);
  }

  @Get()
  async findAllByRestaurant(
    @Param('restaurantId') restaurantId: string,
  ): Promise<Visit[]> {
    return await this.visitService.findAllByRestaurant(restaurantId);
  }
}
