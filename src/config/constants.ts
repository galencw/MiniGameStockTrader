import { DEFAULT_CONSTANTS, type GameConstants } from '../game/types';

// ── Re-export DEFAULT_CONSTANTS ──────────────────────────────────────────────
export { DEFAULT_CONSTANTS };
export type { GameConstants };

// ── Supplementary Constants ──────────────────────────────────────────────────

/** Price change per slot from pure drift (baseline random walk) */
export const BASE_DRIFT_PER_SLOT = 0.002; // ~0.2% per slot

/** Max absolute price change from volatility in one slot */
export const MAX_VOLATILITY_CHANGE_PER_SLOT = 0.01; // 1%

/** How much each sentiment point affects price per slot */
export const SENTIMENT_PRICE_PER_SLOT = 0.003; // matches DEFAULT_CONSTANTS.sentimentPriceEffect

/** Drawdown threshold for hand-limit reduction (in pct, e.g. 0.15 = 15%) */
export const DRAWDOWN_HAND_LIMIT_THRESHOLD = 0.15;

/** Minimum drawdown to start reducing hand limit */
export const MIN_DRAWDOWN_FOR_LIMIT = 0.1;

/** Combat: how many slots per combat round */
export const COMBAT_SLOTS_PER_ROUND = 3;

/** Combat: price recovery after combat ends (bias pct) */
export const COMBAT_END_PRICE_BIAS = 0.5;

/** Combat: bonus cash for surviving combat */
export const COMBAT_SURVIVAL_BONUS = 500;

/** Deck reshuffle: how many cards drawn from discard when deck is empty */
export const RESHUFFLE_BONUS_DRAW = 1;

/** Maximum leverage multiplier that can stack */
export const MAX_LEVERAGE_MULTIPLIER = 4;

/** Position value bonus when player reaches target net worth */
export const TARGET_REACHED_BONUS = 2000;

// ── Initial Player Deck ──────────────────────────────────────────────────────
/** Card IDs and how many copies of each in the starting player deck. */
export const INITIAL_DECK_COMPOSITION: Record<string, number> = {
  // Basic Buy — core offense
  'small-buy': 3,
  'medium-buy': 2,
  'large-buy': 1,
  'bottom-fisher': 1,
  // Basic Sell — cash management
  'small-sell': 2,
  'medium-sell': 1,
  'panic-sell': 1,
  'strategic-sell': 1,
  // Skill — utility
  'cash-injection': 2,
  'market-research': 1,
  'damage-control': 1,
  'leverage-up': 1,
  'shield-wall': 1,
  // Event — market flavor
  'good-news': 1,
  'bad-rumor': 1,
};

/** Total cards in initial deck (computed from composition) */
export const INITIAL_DECK_SIZE = Object.values(INITIAL_DECK_COMPOSITION).reduce((a, b) => a + b, 0); // 18