# Dining — back-end

API para cadastrar restaurantes, registrar visitas com nota e, principalmente,
responder a pergunta que motivou o projeto: **"entao, a gente vai comer onde?"**

Stack: NestJS 11, Prisma 7 (driver adapter `pg`), PostgreSQL.

## Rodando

```bash
npm install                 # roda `prisma generate` no postinstall
cp .env.example .env        # ajuste DATABASE_URL
npx prisma migrate deploy
npm run start:dev
```

- API: `http://localhost:3000`
- Documentacao (Swagger): `http://localhost:3000/api`
- Healthcheck: `http://localhost:3000/health`

## Modelo

- **CuisineType** — tipo de culinaria. Relacao N:N com restaurante, porque um
  lugar pode ser japones *e* peruano.
- **Tag** — caracteristica livre (romantico, aceita pet, tem estacionamento).
  Tambem N:N.
- **Restaurant** — nome, endereco, faixa de preco (`priceRange`), situacao
  (`status`: `ACTIVE`/`ARCHIVED`), prioridade de desejo (`wishlistPriority`)
  e o veredito `wouldReturn`.
- **Visit** — uma ida, com data e nota de 1 a 5. Apagar o restaurante apaga as
  visitas em cascata.

`wouldReturn` fica no restaurante, e nao na visita, porque e um veredito atual
("voltaria?"), nao um registro historico.

## Endpoints

| Metodo | Rota | O que faz |
| --- | --- | --- |
| `GET` | `/health` | App + conexao com o banco |
| `POST` `GET` | `/cuisine-types` | Cria / lista tipos de culinaria |
| `GET` `PATCH` `DELETE` | `/cuisine-types/:id` | Detalha / atualiza / remove |
| `POST` `GET` | `/tags` | Cria / lista tags |
| `GET` `PATCH` `DELETE` | `/tags/:id` | Detalha / atualiza / remove |
| `POST` `GET` | `/restaurants` | Cadastra / lista com resumo de visitas |
| `GET` | `/restaurants/suggestion` | **Sugere onde comer** |
| `GET` `PATCH` `DELETE` | `/restaurants/:id` | Detalha (com historico) / atualiza / remove |
| `POST` `GET` | `/restaurants/:id/visits` | Registra / lista visitas |
| `GET` `PATCH` `DELETE` | `/restaurants/:id/visits/:visitId` | Detalha / atualiza / remove |

### Sugestao

`GET /restaurants/suggestion` aceita os mesmos filtros da listagem
(`cuisineTypeIds`, `tagIds`, `priceRanges`, `city`, `neighborhood`,
`onlyWouldReturn`, `onlyNotVisited`, `search`), mais `strategy` e `limit`.

```bash
# as 3 melhores opcoes baratas onde voces voltariam
curl "localhost:3000/restaurants/suggestion?priceRanges=CHEAP&onlyWouldReturn=true"

# sorteia um lugar novo, para quando ninguem quer decidir
curl "localhost:3000/restaurants/suggestion?onlyNotVisited=true&strategy=RANDOM&limit=1"
```

Cada resultado vem com `score` e `reasons`, para o front conseguir explicar a
escolha ("faz 8 meses que voces nao vao", "esta no topo da lista de desejo").

A heuristica esta isolada em [`src/restaurant/restaurant.scoring.ts`](src/restaurant/restaurant.scoring.ts) —
funcao pura, com os pesos no topo do arquivo e coberta por testes unitarios.

## Testes

```bash
npm test          # unitarios (funcao pura de score, sem banco)
npm run test:e2e  # e2e contra um Postgres real; cria e limpa os proprios dados
```

O e2e usa o `DATABASE_URL` do `.env`. Ele cria registros com nomes unicos e os
apaga no `afterAll`, mas ainda assim aponte para um banco de desenvolvimento.
