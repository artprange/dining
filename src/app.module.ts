import { Module } from '@nestjs/common';
import { CuisineTypeModule } from './cuisine-type/cuisine-type.module';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { VisitModule } from './visit/visit.module';

@Module({
  imports: [PrismaModule, CuisineTypeModule, RestaurantModule, VisitModule],
})
export class AppModule {}
