import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantService } from './restaurant.service';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  create(@Body() data: CreateRestaurantDto) {
    return this.restaurantService.create(data);
  }

  @Get()
  findAll() {
    return this.restaurantService.findAll();
  }
}
