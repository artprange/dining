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
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { FindRestaurantsDto } from './dto/find-restaurants.dto';
import { RestaurantService } from './restaurant.service';
import { SuggestRestaurantDto } from './dto/suggest-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um restaurante' })
  create(@Body() data: CreateRestaurantDto) {
    return this.restaurantService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lista restaurantes com resumo de visitas' })
  findAll(@Query() filters: FindRestaurantsDto) {
    return this.restaurantService.findAll(filters);
  }

  // Precisa vir antes de `:id`, senao o Nest casa "suggestion" como um id.
  @Get('suggestion')
  @ApiOperation({
    summary: 'Sugere onde comer',
    description:
      'Aplica os filtros e devolve uma lista curta ordenada por uma heuristica ' +
      '(nota, se voltaria, prioridade de desejo e tempo desde a ultima visita), ' +
      'ou sorteia entre os candidatos quando strategy=RANDOM.',
  })
  suggest(@Query() query: SuggestRestaurantDto) {
    return this.restaurantService.suggest(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalha um restaurante, com o historico de visitas',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualiza um restaurante',
    description:
      'Inclui o veredito `wouldReturn`, que antes nao tinha rota de escrita.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateRestaurantDto,
  ) {
    return this.restaurantService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.remove(id);
  }
}
