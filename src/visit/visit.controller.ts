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
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitService } from './visit.service';

@ApiTags('visits')
@Controller('restaurants/:restaurantId/visits')
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post()
  @ApiOperation({ summary: 'Registra uma visita com nota' })
  create(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Body() data: CreateVisitDto,
  ) {
    return this.visitService.create(restaurantId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as visitas de um restaurante' })
  findAllByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
  ) {
    return this.visitService.findAllByRestaurant(restaurantId);
  }

  @Get(':id')
  findOne(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.visitService.findOne(restaurantId, id);
  }

  @Patch(':id')
  update(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateVisitDto,
  ) {
    return this.visitService.update(restaurantId, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.visitService.remove(restaurantId, id);
  }
}
