import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  PriceRange,
  RestaurantStatus,
  WishlistPriority,
} from '../../generated/prisma/enums';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Cantina do Bairro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    type: [String],
    description:
      'Um lugar pode ter mais de uma culinaria (ex.: japonesa e peruana).',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  cuisineTypeIds!: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ enum: PriceRange })
  @IsEnum(PriceRange)
  @IsOptional()
  priceRange?: PriceRange;

  @ApiPropertyOptional({
    enum: RestaurantStatus,
    default: RestaurantStatus.ACTIVE,
  })
  @IsEnum(RestaurantStatus)
  @IsOptional()
  status?: RestaurantStatus;

  @ApiPropertyOptional({
    enum: WishlistPriority,
    default: WishlistPriority.NORMAL,
    description: 'Quanto voces querem ir. Alimenta o endpoint de sugestao.',
  })
  @IsEnum(WishlistPriority)
  @IsOptional()
  wishlistPriority?: WishlistPriority;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(80)
  neighborhood?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(80)
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Veredito atual. Normalmente so faz sentido depois da primeira visita.',
  })
  @IsBoolean()
  @IsOptional()
  wouldReturn?: boolean;
}
