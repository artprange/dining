import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCuisineTypeDto {
  @ApiProperty({ example: 'Japonesa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;
}
