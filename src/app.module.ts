import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CuisineTypeModule } from './cuisine-type/cuisine-type.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [PrismaModule, CuisineTypeModule, RestaurantModule],
})
export class AppModule {}
