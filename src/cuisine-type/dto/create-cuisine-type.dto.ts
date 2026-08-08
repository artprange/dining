import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCuisineTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
