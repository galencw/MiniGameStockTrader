import type { GameState, CardInstance, CardConfig } from './types';
import { createRNG } from './rng';
import { CARD_BY_ID } from '../config';

/**
 * Select the best card for the opponent to play based on game state and policy weights.
 *
 * Scoring is based on:
 * - Base score = card's aiWeight
 * - Multiplied by policy weights depending on game conditions
 * - Cards that cost more than opponent's cash are excluded (score = 0)
 *
 * Returns the highest-scoring card, or null if no valid card can be played.
 */
export function selectOpponentCard(state: GameState): CardInstance | null {
  if (!state.opponent || !state.opponentConfig) return null;

  const { opponent, opponentConfig, player, price, sentiment } = state;

  if (opponent.hand.length === 0) return null;

  const rng = createRNG(state.rngSeed);

  interface ScoredCard {
    card: CardInstance;
    config: CardConfig;
    score: number;
  }

  const scoredCards: ScoredCard[] = [];

  for (const cardInst of opponent.hand) {
    const config = CARD_BY_ID.get(cardInst.configId);
    if (!config) continue;

    let score = config.aiWeight;

    // Can't afford: score = 0
    if (config.cost > opponent.cash) {
      continue; // Skip entirely — can't play
    }

    // Policy weight: press when player position is high
    const playerPositionValue = player.shares * price;
    if (playerPositionValue > 5000 && config.direction === 'short') {
      score *= 1 + opponentConfig.policyWeights.pressWhenPlayerPositionHigh;
    }

    // Policy weight: press when sentiment is negative
    if (sentiment < 0 && config.direction === 'short') {
      score *= 1 + opponentConfig.policyWeights.pressWhenSentimentNegative;
    }

    // Policy weight: conserve when funds low
    if (opponent.cash < 3000 && (config.type === 'skill')) {
      score *= 1 + opponentConfig.policyWeights.conserveWhenFundsLow;
    }

    // Policy weight: event when player cash low
    if (player.cash < 2000 && config.type === 'event') {
      score *= 1 + opponentConfig.policyWeights.eventWhenPlayerCashLow;
    }

    scoredCards.push({ card: cardInst, config, score });
  }

  if (scoredCards.length === 0) return null;

  // Sort by score descending
  scoredCards.sort((a, b) => b.score - a.score);

  // Find all cards tied for highest score
  const highestScore = scoredCards[0].score;
  const tiedCards = scoredCards.filter((c) => c.score === highestScore);

  // Break ties with RNG
  if (tiedCards.length === 1) {
    return tiedCards[0].card;
  }

  const tieIndex = rng.nextInt(0, tiedCards.length - 1);
  return tiedCards[tieIndex].card;
}
