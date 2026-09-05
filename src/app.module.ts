import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CuisineTypeModule } from './cuisine-type/cuisine-type.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { TagModule } from './tag/tag.module';
import { VisitModule } from './visit/visit.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    CuisineTypeModule,
    TagModule,
    RestaurantModule,
    VisitModule,
  ],
})
export class AppModule {}
