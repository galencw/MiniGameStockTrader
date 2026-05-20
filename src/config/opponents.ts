import type { OpponentConfig } from '../game/types';

/**
 * Three opponents of increasing difficulty.
 * deckCardIds reference card IDs from cards.ts.
 * triggerWindows are defined for hours 2, 4, 6 (each hour = 6 slots).
 */

// ── 小空头 / Small Bear (Easy) ───────────────────────────────────────────────
// A beginner-level short seller. Low aggression, basic deck, fewer trigger windows.

const smallBear: OpponentConfig = {
  id: 'small-bear',
  name: '小空头 / Small Bear',
  avatar: 'small-bear',
  startingFunds: 5000,
  deckCardIds: [
    'short-attack',
    'short-attack',
    'heavy-short',
    'cash-injection',
    'cash-injection',
    'bad-rumor',
    'market-washout',
    'small-sell',
    'small-buy',
    'market-research',
  ],
  aggression: 0.3,
  conservatism: 0.6,
  triggerWindows: [
    { hourStart: 2, hourEnd: 2, probability: 0.3 },
    { hourStart: 4, hourEnd: 4, probability: 0.4 },
    { hourStart: 6, hourEnd: 6, probability: 0.5 },
  ],
  policyWeights: {
    pressWhenPlayerPositionHigh: 0.2,
    pressWhenSentimentNegative: 0.3,
    conserveWhenFundsLow: 0.7,
    eventWhenPlayerCashLow: 0.2,
  },
  maxCombatRounds: 3,
};

// ── 做空基金 / Short Fund (Medium) ───────────────────────────────────────────
// A mid-level short fund. Balanced aggression, better deck, standard windows.

const shortFund: OpponentConfig = {
  id: 'short-fund',
  name: '做空基金 / Short Fund',
  avatar: 'short-fund',
  startingFunds: 8000,
  deckCardIds: [
    'short-attack',
    'short-attack',
    'heavy-short',
    'bear-raid',
    'leverage-up',
    'cash-injection',
    'cash-injection',
    'bad-rumor',
    'market-washout',
    'quant-gone-wild',
    'small-sell',
    'medium-sell',
    'small-buy',
    'medium-buy',
    'damage-control',
  ],
  aggression: 0.6,
  conservatism: 0.3,
  triggerWindows: [
    { hourStart: 2, hourEnd: 3, probability: 0.5 },
    { hourStart: 4, hourEnd: 5, probability: 0.6 },
    { hourStart: 6, hourEnd: 7, probability: 0.7 },
  ],
  policyWeights: {
    pressWhenPlayerPositionHigh: 0.5,
    pressWhenSentimentNegative: 0.5,
    conserveWhenFundsLow: 0.4,
    eventWhenPlayerCashLow: 0.4,
  },
  maxCombatRounds: 4,
};

// ── 量化大佬 / Quant Boss (Hard) ────────────────────────────────────────────
// A ruthless quant trader. High aggression, full deck, aggressive windows.

const quantBoss: OpponentConfig = {
  id: 'quant-boss',
  name: '量化大佬 / Quant Boss',
  avatar: 'quant-boss',
  startingFunds: 12000,
  deckCardIds: [
    'short-attack',
    'short-attack',
    'heavy-short',
    'heavy-short',
    'bear-raid',
    'leverage-up',
    'double-down',
    'insider-tip',
    'cash-injection',
    'bad-rumor',
    'market-washout',
    'quant-gone-wild',
    'flash-crash',
    'small-sell',
    'medium-sell',
    'medium-buy',
    'position-builder',
    'market-research',
  ],
  aggression: 0.8,
  conservatism: 0.1,
  triggerWindows: [
    { hourStart: 1, hourEnd: 3, probability: 0.7 },
    { hourStart: 3, hourEnd: 5, probability: 0.8 },
    { hourStart: 5, hourEnd: 7, probability: 0.9 },
  ],
  policyWeights: {
    pressWhenPlayerPositionHigh: 0.8,
    pressWhenSentimentNegative: 0.7,
    conserveWhenFundsLow: 0.15,
    eventWhenPlayerCashLow: 0.6,
  },
  maxCombatRounds: 6,
};

// ── Aggregate ────────────────────────────────────────────────────────────────

export const OPPONENTS: OpponentConfig[] = [
  smallBear,
  shortFund,
  quantBoss,
];

/** Lookup an opponent by id */
export const OPPONENT_BY_ID = new Map<string, OpponentConfig>(
  OPPONENTS.map((o) => [o.id, o]),
);