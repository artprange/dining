import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateVisitDto {
  @IsDateString()
  visitedAt!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsBoolean()
  wouldReturn!: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
