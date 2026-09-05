import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';

/**
 * Tudo opcional. E por aqui que `wouldReturn` finalmente vira gravavel:
 * antes o campo existia no banco e nao tinha nenhuma rota que o escrevesse.
 */
export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}
