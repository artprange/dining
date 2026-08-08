import { Module } from '@nestjs/common';
import { CuisineTypeController } from './cuisine-type.controller';
import { CuisineTypeService } from './cuisine-type.service';

@Module({
  controllers: [CuisineTypeController],
  providers: [CuisineTypeService],
})
export class CuisineTypeModule {}
