// ── Barrel export for all game config ─────────────────────────────────────────

export { ALL_CARDS, CARD_BY_ID } from './cards';
export { RANDOM_EVENTS, BACKGROUND_EVENTS, EVENT_BY_ID } from './events';
export { OPPONENTS, OPPONENT_BY_ID } from './opponents';
export {
  DEFAULT_CONSTANTS,
  INITIAL_DECK_COMPOSITION,
  INITIAL_DECK_SIZE,
  BASE_DRIFT_PER_SLOT,
  MAX_VOLATILITY_CHANGE_PER_SLOT,
  SENTIMENT_PRICE_PER_SLOT,
  DRAWDOWN_HAND_LIMIT_THRESHOLD,
  MIN_DRAWDOWN_FOR_LIMIT,
  COMBAT_SLOTS_PER_ROUND,
  COMBAT_END_PRICE_BIAS,
  COMBAT_SURVIVAL_BONUS,
  RESHUFFLE_BONUS_DRAW,
  MAX_LEVERAGE_MULTIPLIER,
  TARGET_REACHED_BONUS,
} from './constants';
export type { GameConstants } from './constants';