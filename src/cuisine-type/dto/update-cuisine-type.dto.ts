import { PartialType } from '@nestjs/swagger';
import { CreateCuisineTypeDto } from './create-cuisine-type.dto';

export class UpdateCuisineTypeDto extends PartialType(CreateCuisineTypeDto) {}
