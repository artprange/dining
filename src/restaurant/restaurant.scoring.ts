import { WishlistPriority } from '../generated/prisma/enums';

/**
 * Heuristica de desempate para o endpoint de sugestao.
 *
 * A ideia nao e ser "correta", e sim quebrar a indecisao com um criterio
 * explicito: lugar bom, que voce voltaria, que esta na fila de desejo e que
 * voce nao visita ha um tempo sobe; lugar que voce disse que nao voltaria some.
 */
export const RATING_WEIGHT = 10;

/** Nota assumida para quem nunca foi visitado, para nao ficar atras de um lugar ruim. */
export const NEUTRAL_RATING = 3;

export const WOULD_RETURN_BONUS = 15;
export const WOULD_NOT_RETURN_PENALTY = -40;
export const NEVER_VISITED_BONUS = 8;
export const MAX_STALENESS_BONUS = 15;
export const STALENESS_CAP_IN_DAYS = 180;

const WISHLIST_PRIORITY_BONUS: Record<WishlistPriority, number> = {
  HIGH: 12,
  NORMAL: 0,
  LOW: -8,
};

const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

export interface ScoreInput {
  averageRating: number | null;
  wouldReturn: boolean | null;
  wishlistPriority: WishlistPriority;
  lastVisitedAt: Date | null;
}

export interface ScoreResult {
  score: number;
  reasons: string[];
}

export function daysSince(date: Date, now: Date): number {
  return Math.max(0, (now.getTime() - date.getTime()) / MILLISECONDS_IN_A_DAY);
}

export function scoreRestaurant(
  input: ScoreInput,
  now: Date = new Date(),
): ScoreResult {
  const reasons: string[] = [];

  let score = (input.averageRating ?? NEUTRAL_RATING) * RATING_WEIGHT;

  if (input.averageRating !== null) {
    reasons.push(`Nota media ${input.averageRating.toFixed(1)}.`);
  }

  if (input.wouldReturn === true) {
    score += WOULD_RETURN_BONUS;
    reasons.push('Voce marcou que voltaria.');
  } else if (input.wouldReturn === false) {
    score += WOULD_NOT_RETURN_PENALTY;
    reasons.push('Voce marcou que nao voltaria.');
  }

  score += WISHLIST_PRIORITY_BONUS[input.wishlistPriority];

  if (input.wishlistPriority === WishlistPriority.HIGH) {
    reasons.push('Esta no topo da lista de desejo.');
  }

  if (input.lastVisitedAt === null) {
    score += NEVER_VISITED_BONUS;
    reasons.push('Voces nunca foram.');
  } else {
    const days = daysSince(input.lastVisitedAt, now);
    const staleness = Math.min(days, STALENESS_CAP_IN_DAYS);

    score += (staleness / STALENESS_CAP_IN_DAYS) * MAX_STALENESS_BONUS;
    reasons.push(`Ultima visita ha ${Math.round(days)} dia(s).`);
  }

  return { score: Number(score.toFixed(2)), reasons };
}
