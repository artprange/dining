import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CuisineTypeService } from './cuisine-type.service';
import { CreateCuisineTypeDto } from './dto/create-cuisine-type.dto';
import { UpdateCuisineTypeDto } from './dto/update-cuisine-type.dto';

@ApiTags('cuisine-types')
@Controller('cuisine-types')
export class CuisineTypeController {
  constructor(private readonly cuisineTypeService: CuisineTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um tipo de culinaria' })
  create(@Body() data: CreateCuisineTypeDto) {
    return this.cuisineTypeService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os tipos de culinaria' })
  findAll() {
    return this.cuisineTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cuisineTypeService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateCuisineTypeDto,
  ) {
    return this.cuisineTypeService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cuisineTypeService.remove(id);
  }
}
