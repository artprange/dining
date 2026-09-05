import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { FindRestaurantsDto } from './find-restaurants.dto';

export enum SuggestionStrategy {
  /** Ordena pelo score da heuristica. Bom para "me da as 3 melhores opcoes". */
  RANKED = 'RANKED',
  /** Sorteia entre os que passaram no filtro. Bom para quando nenhum dos dois quer decidir. */
  RANDOM = 'RANDOM',
}

export class SuggestRestaurantDto extends FindRestaurantsDto {
  @ApiPropertyOptional({
    enum: SuggestionStrategy,
    default: SuggestionStrategy.RANKED,
  })
  @IsEnum(SuggestionStrategy)
  @IsOptional()
  strategy?: SuggestionStrategy = SuggestionStrategy.RANKED;

  @ApiPropertyOptional({ default: 3, minimum: 1, maximum: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  limit?: number = 3;
}
