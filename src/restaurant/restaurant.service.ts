import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '../generated/prisma/client';
import { RestaurantStatus } from '../generated/prisma/enums';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { FindRestaurantsDto } from './dto/find-restaurants.dto';
import {
  SuggestRestaurantDto,
  SuggestionStrategy,
} from './dto/suggest-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { scoreRestaurant } from './restaurant.scoring';

/** Agregados de visita por restaurante, calculados no banco. */
interface VisitStats {
  visitCount: number;
  averageRating: number | null;
  lastVisitedAt: Date | null;
}

const EMPTY_STATS: VisitStats = {
  visitCount: 0,
  averageRating: null,
  lastVisitedAt: null,
};

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ cuisineTypeIds, tagIds, ...data }: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: {
        ...data,
        cuisineTypes: { connect: cuisineTypeIds.map((id) => ({ id })) },
        tags: { connect: (tagIds ?? []).map((id) => ({ id })) },
      },
      include: { cuisineTypes: true, tags: true },
    });
  }

  async findAll(filters: FindRestaurantsDto) {
    const restaurants = await this.prisma.restaurant.findMany({
      where: this.buildWhere(filters),
      include: { cuisineTypes: true, tags: true },
      orderBy: { name: 'asc' },
    });

    const stats = await this.loadVisitStats(restaurants.map(({ id }) => id));

    return restaurants.map((restaurant) => this.withSummary(restaurant, stats));
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        cuisineTypes: true,
        tags: true,
        visits: { orderBy: { visitedAt: 'desc' } },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurante ${id} nao encontrado.`);
    }

    const stats = await this.loadVisitStats([id]);

    return this.withSummary(restaurant, stats);
  }

  async update(
    id: string,
    { cuisineTypeIds, tagIds, ...data }: UpdateRestaurantDto,
  ) {
    await this.ensureExists(id);

    return this.prisma.restaurant.update({
      where: { id },
      data: {
        ...data,
        // `set` troca a lista inteira: e o que um PATCH com a lista completa espera.
        ...(cuisineTypeIds && {
          cuisineTypes: {
            set: cuisineTypeIds.map((cuisineTypeId) => ({ id: cuisineTypeId })),
          },
        }),
        ...(tagIds && {
          tags: { set: tagIds.map((tagId) => ({ id: tagId })) },
        }),
      },
      include: { cuisineTypes: true, tags: true },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);

    await this.prisma.restaurant.delete({ where: { id } });
  }

  /**
   * O ponto do projeto: dado um filtro, responde "entao vamos aonde?".
   */
  async suggest({ strategy, limit, ...filters }: SuggestRestaurantDto) {
    const candidates = await this.findAll(filters);

    const take = limit ?? 3;

    const scored = candidates.map((restaurant) => ({
      ...restaurant,
      ...scoreRestaurant({
        averageRating: restaurant.averageRating,
        wouldReturn: restaurant.wouldReturn,
        wishlistPriority: restaurant.wishlistPriority,
        lastVisitedAt: restaurant.lastVisitedAt,
      }),
    }));

    if (strategy === SuggestionStrategy.RANDOM) {
      return this.pickRandom(scored, take);
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, take);
  }

  private buildWhere(filters: FindRestaurantsDto): Prisma.RestaurantWhereInput {
    const {
      search,
      cuisineTypeIds,
      tagIds,
      priceRanges,
      city,
      neighborhood,
      status,
      onlyWouldReturn,
      onlyNotVisited,
    } = filters;

    return {
      status: status ?? RestaurantStatus.ACTIVE,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(cuisineTypeIds?.length && {
        cuisineTypes: { some: { id: { in: cuisineTypeIds } } },
      }),
      ...(tagIds?.length && { tags: { some: { id: { in: tagIds } } } }),
      ...(priceRanges?.length && { priceRange: { in: priceRanges } }),
      ...(city && { city: { equals: city, mode: 'insensitive' } }),
      ...(neighborhood && {
        neighborhood: { equals: neighborhood, mode: 'insensitive' },
      }),
      ...(onlyWouldReturn && { wouldReturn: true }),
      ...(onlyNotVisited && { visits: { none: {} } }),
    };
  }

  /**
   * Uma unica query agregada para todos os restaurantes, em vez de trazer
   * todas as visitas de todo mundo so para somar em memoria.
   */
  private async loadVisitStats(
    restaurantIds: string[],
  ): Promise<Map<string, VisitStats>> {
    if (restaurantIds.length === 0) {
      return new Map();
    }

    const grouped = await this.prisma.visit.groupBy({
      by: ['restaurantId'],
      where: { restaurantId: { in: restaurantIds } },
      _count: { _all: true },
      _avg: { rating: true },
      _max: { visitedAt: true },
    });

    return new Map(
      grouped.map((row) => [
        row.restaurantId,
        {
          visitCount: row._count._all,
          averageRating:
            row._avg.rating === null
              ? null
              : Number(row._avg.rating.toFixed(2)),
          lastVisitedAt: row._max.visitedAt,
        },
      ]),
    );
  }

  private withSummary<T extends { id: string }>(
    restaurant: T,
    stats: Map<string, VisitStats>,
  ) {
    const { visitCount, averageRating, lastVisitedAt } =
      stats.get(restaurant.id) ?? EMPTY_STATS;

    return {
      ...restaurant,
      visited: visitCount > 0,
      visitCount,
      averageRating,
      lastVisitedAt,
    };
  }

  private pickRandom<T>(items: T[], take: number): T[] {
    const pool = [...items];
    const picked: T[] = [];

    while (pool.length > 0 && picked.length < take) {
      const [item] = pool.splice(Math.floor(Math.random() * pool.length), 1);
      picked.push(item);
    }

    return picked;
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.restaurant.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Restaurante ${id} nao encontrado.`);
    }
  }
}
