import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PriceRange, RestaurantStatus } from '../../generated/prisma/enums';
import {
  ToBoolean,
  ToStringArray,
} from '../../common/transforms/query-transforms';

/** Filtros compartilhados entre a listagem e a sugestao. */
export class FindRestaurantsDto {
  @ApiPropertyOptional({
    description: 'Busca por parte do nome (case-insensitive).',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Aceita `a,b` ou repetido.',
  })
  @ToStringArray()
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  cuisineTypeIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @ToStringArray()
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ enum: PriceRange, isArray: true })
  @ToStringArray()
  @IsArray()
  @IsEnum(PriceRange, { each: true })
  @IsOptional()
  priceRanges?: PriceRange[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiPropertyOptional({
    enum: RestaurantStatus,
    default: RestaurantStatus.ACTIVE,
    description: 'Por padrao arquivados ficam de fora.',
  })
  @IsEnum(RestaurantStatus)
  @IsOptional()
  status?: RestaurantStatus = RestaurantStatus.ACTIVE;

  @ApiPropertyOptional({
    description: 'Somente lugares marcados como "voltaria".',
  })
  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  onlyWouldReturn?: boolean;

  @ApiPropertyOptional({
    description: 'Somente lugares que voces ainda nao visitaram.',
  })
  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  onlyNotVisited?: boolean;
}
