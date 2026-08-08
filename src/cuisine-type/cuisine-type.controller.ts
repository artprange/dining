import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateCuisineTypeDto } from './dto/create-cuisine-type.dto';
import { CuisineTypeService } from './cuisine-type.service';

@Controller('cuisine-types')
export class CuisineTypeController {
  constructor(private readonly cuisineTypeService: CuisineTypeService) {}

  @Post()
  create(@Body() data: CreateCuisineTypeDto) {
    return this.cuisineTypeService.create(data);
  }

  @Get()
  findAll() {
    return this.cuisineTypeService.findAll();
  }
}
