import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxDate,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVisitDto {
  @ApiProperty({ example: '2026-09-01T20:30:00.000Z' })
  @Type(() => Date)
  @IsDate()
  @MaxDate(() => new Date(), { message: 'visitedAt nao pode estar no futuro.' })
  visitedAt!: Date;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
