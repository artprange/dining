import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

interface IdentifiedResponse {
  id: string;
  name: string;
}

interface RestaurantResponse extends IdentifiedResponse {
  status: string;
  wouldReturn: boolean | null;
  visited: boolean;
  visitCount: number;
  averageRating: number | null;
  cuisineTypes: IdentifiedResponse[];
  tags: IdentifiedResponse[];
  visits?: unknown[];
}

interface SuggestionResponse extends RestaurantResponse {
  score: number;
  reasons: string[];
}

interface HealthResponse {
  status: string;
  database: string;
}

/** `response.body` do supertest e `any`; isso concentra a conversao num lugar so. */
function bodyOf<T>(response: request.Response): T {
  return response.body as T;
}

/**
 * E2E contra um Postgres real. Cria os proprios registros com nomes unicos
 * e limpa tudo no final para nao sujar o banco de desenvolvimento.
 */
describe('Dining (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const suffix = Date.now();
  const cuisineName = `e2e-italiana-${suffix}`;
  const tagName = `e2e-romantico-${suffix}`;
  const restaurantName = `E2E Cantina ${suffix}`;

  let cuisineTypeId: string;
  let tagId: string;
  let restaurantId: string;

  const server = () => app.getHttpServer();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(
      new PrismaExceptionFilter(app.get(HttpAdapterHost).httpAdapter),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.restaurant.deleteMany({ where: { name: restaurantName } });
      await prisma.cuisineType.deleteMany({ where: { name: cuisineName } });
      await prisma.tag.deleteMany({ where: { name: tagName } });
    }

    await app?.close();
  });

  it('GET /health responde com o banco de pe', async () => {
    const body = bodyOf<HealthResponse>(
      await request(server()).get('/health').expect(200),
    );

    expect(body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('POST /cuisine-types cria um tipo de culinaria', async () => {
    const body = bodyOf<IdentifiedResponse>(
      await request(server())
        .post('/cuisine-types')
        .send({ name: cuisineName })
        .expect(201),
    );

    cuisineTypeId = body.id;
    expect(body.name).toBe(cuisineName);
  });

  it('POST /cuisine-types devolve 409 no nome duplicado, nao 500', async () => {
    await request(server())
      .post('/cuisine-types')
      .send({ name: cuisineName })
      .expect(409);
  });

  it('POST /tags cria uma tag', async () => {
    const body = bodyOf<IdentifiedResponse>(
      await request(server()).post('/tags').send({ name: tagName }).expect(201),
    );

    tagId = body.id;
    expect(body.name).toBe(tagName);
  });

  it('POST /restaurants aceita multiplas culinarias e tags', async () => {
    const body = bodyOf<RestaurantResponse>(
      await request(server())
        .post('/restaurants')
        .send({
          name: restaurantName,
          cuisineTypeIds: [cuisineTypeId],
          tagIds: [tagId],
          priceRange: 'MODERATE',
          wishlistPriority: 'HIGH',
          city: 'Sao Paulo',
          neighborhood: 'Pinheiros',
        })
        .expect(201),
    );

    restaurantId = body.id;
    expect(body.cuisineTypes).toHaveLength(1);
    expect(body.tags).toHaveLength(1);
    expect(body.status).toBe('ACTIVE');
  });

  it('POST /restaurants devolve 404 quando a culinaria nao existe', async () => {
    await request(server())
      .post('/restaurants')
      .send({
        name: `E2E Fantasma ${suffix}`,
        cuisineTypeIds: ['00000000-0000-4000-8000-000000000000'],
      })
      .expect(404);
  });

  it('POST /restaurants devolve 400 em campo desconhecido', async () => {
    await request(server())
      .post('/restaurants')
      .send({
        name: `E2E Invalido ${suffix}`,
        cuisineTypeIds: [cuisineTypeId],
        campoQueNaoExiste: 'x',
      })
      .expect(400);
  });

  it('POST /restaurants/:id/visits recusa data no futuro', async () => {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();

    await request(server())
      .post(`/restaurants/${restaurantId}/visits`)
      .send({ visitedAt: tomorrow, rating: 5 })
      .expect(400);
  });

  it('POST /restaurants/:id/visits devolve 404 para restaurante inexistente', async () => {
    await request(server())
      .post('/restaurants/00000000-0000-4000-8000-000000000000/visits')
      .send({ visitedAt: '2026-08-01T20:00:00.000Z', rating: 5 })
      .expect(404);
  });

  it('POST /restaurants/:id/visits registra a nota', async () => {
    await request(server())
      .post(`/restaurants/${restaurantId}/visits`)
      .send({
        visitedAt: '2026-08-01T20:00:00.000Z',
        rating: 5,
        notes: 'massa boa',
      })
      .expect(201);

    await request(server())
      .post(`/restaurants/${restaurantId}/visits`)
      .send({ visitedAt: '2026-08-20T20:00:00.000Z', rating: 4 })
      .expect(201);
  });

  it('GET /restaurants traz o resumo agregado sem despejar as visitas', async () => {
    const body = bodyOf<RestaurantResponse[]>(
      await request(server())
        .get(`/restaurants?search=${encodeURIComponent(restaurantName)}`)
        .expect(200),
    );

    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      visited: true,
      visitCount: 2,
      averageRating: 4.5,
    });
    expect(body[0].visits).toBeUndefined();
  });

  it('PATCH /restaurants/:id grava o veredito wouldReturn', async () => {
    const body = bodyOf<RestaurantResponse>(
      await request(server())
        .patch(`/restaurants/${restaurantId}`)
        .send({ wouldReturn: true })
        .expect(200),
    );

    expect(body.wouldReturn).toBe(true);
  });

  it('GET /restaurants/suggestion respeita os filtros e pontua', async () => {
    const body = bodyOf<SuggestionResponse[]>(
      await request(server())
        .get(
          '/restaurants/suggestion?onlyWouldReturn=true&priceRanges=MODERATE&limit=3',
        )
        .expect(200),
    );

    const suggestion = body.find((item) => item.id === restaurantId);

    expect(suggestion).toBeDefined();
    expect(typeof suggestion?.score).toBe('number');
    expect(suggestion?.reasons).toEqual(
      expect.arrayContaining(['Voce marcou que voltaria.']),
    );
  });

  it('GET /restaurants/suggestion nao confunde "suggestion" com um id', async () => {
    await request(server()).get('/restaurants/suggestion').expect(200);
  });

  it('GET /restaurants/:id devolve 404 para id inexistente', async () => {
    await request(server())
      .get('/restaurants/00000000-0000-4000-8000-000000000000')
      .expect(404);
  });

  it('GET /restaurants/:id devolve 400 para id malformado', async () => {
    await request(server()).get('/restaurants/nao-e-uuid').expect(400);
  });

  it('DELETE /restaurants/:id remove o restaurante e as visitas em cascata', async () => {
    await request(server()).delete(`/restaurants/${restaurantId}`).expect(204);

    const remaining = await prisma.visit.count({ where: { restaurantId } });
    expect(remaining).toBe(0);
  });
});
