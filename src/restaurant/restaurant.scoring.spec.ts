import { WishlistPriority } from '../generated/prisma/enums';
import {
  NEVER_VISITED_BONUS,
  NEUTRAL_RATING,
  RATING_WEIGHT,
  STALENESS_CAP_IN_DAYS,
  WOULD_NOT_RETURN_PENALTY,
  scoreRestaurant,
} from './restaurant.scoring';

const NOW = new Date('2026-09-05T12:00:00.000Z');

function daysAgo(days: number): Date {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
}

const BASE_RATING = 4;

function baseInput(
  overrides: Partial<Parameters<typeof scoreRestaurant>[0]> = {},
) {
  return {
    averageRating: BASE_RATING as number | null,
    wouldReturn: null,
    wishlistPriority: WishlistPriority.NORMAL,
    lastVisitedAt: daysAgo(30),
    ...overrides,
  };
}

describe('scoreRestaurant', () => {
  it('usa nota neutra para quem nunca foi visitado', () => {
    const { score } = scoreRestaurant(
      baseInput({ averageRating: null, lastVisitedAt: null }),
      NOW,
    );

    expect(score).toBe(NEUTRAL_RATING * RATING_WEIGHT + NEVER_VISITED_BONUS);
  });

  it('coloca "nao voltaria" atras de qualquer lugar razoavel', () => {
    const rejected = scoreRestaurant(
      baseInput({ averageRating: 5, wouldReturn: false }),
      NOW,
    );
    const mediocre = scoreRestaurant(baseInput({ averageRating: 2 }), NOW);

    expect(rejected.score).toBeLessThan(mediocre.score);
    expect(rejected.reasons).toContain('Voce marcou que nao voltaria.');
  });

  it('aplica a penalidade de "nao voltaria" integralmente', () => {
    const neutral = scoreRestaurant(baseInput({ wouldReturn: null }), NOW);
    const rejected = scoreRestaurant(baseInput({ wouldReturn: false }), NOW);

    expect(rejected.score - neutral.score).toBeCloseTo(
      WOULD_NOT_RETURN_PENALTY,
      2,
    );
  });

  it('prefere o lugar que voces nao visitam ha mais tempo', () => {
    const recent = scoreRestaurant(
      baseInput({ lastVisitedAt: daysAgo(2) }),
      NOW,
    );
    const old = scoreRestaurant(
      baseInput({ lastVisitedAt: daysAgo(150) }),
      NOW,
    );

    expect(old.score).toBeGreaterThan(recent.score);
  });

  it('para de crescer depois do teto de tempo', () => {
    const atCap = scoreRestaurant(
      baseInput({ lastVisitedAt: daysAgo(STALENESS_CAP_IN_DAYS) }),
      NOW,
    );
    const wayPastCap = scoreRestaurant(
      baseInput({ lastVisitedAt: daysAgo(STALENESS_CAP_IN_DAYS * 5) }),
      NOW,
    );

    expect(wayPastCap.score).toBe(atCap.score);
  });

  it('desempata pela prioridade de desejo', () => {
    const high = scoreRestaurant(
      baseInput({ wishlistPriority: WishlistPriority.HIGH }),
      NOW,
    );
    const low = scoreRestaurant(
      baseInput({ wishlistPriority: WishlistPriority.LOW }),
      NOW,
    );

    expect(high.score).toBeGreaterThan(low.score);
    expect(high.reasons).toContain('Esta no topo da lista de desejo.');
  });

  it('nao gera tempo negativo para uma visita no futuro', () => {
    const { score } = scoreRestaurant(
      baseInput({ lastVisitedAt: new Date(NOW.getTime() + 86_400_000) }),
      NOW,
    );

    expect(score).toBe(BASE_RATING * RATING_WEIGHT);
  });
});
