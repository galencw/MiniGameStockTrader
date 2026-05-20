// ── Seeded RNG ──
export interface RNG {
  seed: number;
  next(): number; // 0..1
  nextInt(min: number, max: number): number;
  nextFloat(min: number, max: number): number;
  clone(): RNG;
}

// ── Cards ──
export type CardType = 'basic' | 'skill' | 'event';
export type CardDirection = 'long' | 'short' | 'neutral';
export type EffectTiming = 'immediate' | 'this_turn' | 'next_card' | 'next_settlement';

export interface CardEffect {
  type: 'add_cash' | 'add_shares' | 'heal_drawdown' | 'draw_cards' | 'leverage' | 'sentiment_change' | 'price_bias' | 'volatility_change';
  value: number;
  timing: EffectTiming;
  duration?: number;
}

export interface CardConfig {
  id: string;
  name: string;
  description: string;
  type: CardType;
  direction: CardDirection;
  cost: number;
  faceValuePct: number;
  priceImpactPct: number;
  sentimentDelta: number;
  effects: CardEffect[];
  tags: string[];
  aiWeight: number;
  rarity: 'common' | 'uncommon' | 'rare';
}

export interface CardInstance {
  uid: string;
  configId: string;
}

// ── Events ──
export interface DanmakuLine {
  text: string;
  style?: 'normal' | 'highlight' | 'warning';
}

export interface EventConfig {
  id: string;
  title: string;
  description: string;
  sentimentDelta: number;
  priceBiasPct: number;
  volatilityMultiplier: number;
  danmakuLines: DanmakuLine[];
  weight: number;
  isBackground?: boolean;
}

// ── Opponent ──
export interface TriggerWindow {
  hourStart: number;
  hourEnd: number;
  probability: number;
}

export interface OpponentConfig {
  id: string;
  name: string;
  avatar?: string;
  startingFunds: number;
  deckCardIds: string[];
  aggression: number;
  conservatism: number;
  triggerWindows: TriggerWindow[];
  policyWeights: {
    pressWhenPlayerPositionHigh: number;
    pressWhenSentimentNegative: number;
    conserveWhenFundsLow: number;
    eventWhenPlayerCashLow: number;
  };
  maxCombatRounds: number;
}

// ── Actor State ──
export interface ActorState {
  cash: number;
  shares: number;
  averageCost: number;
  netWorth: number;
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  playedThisTurn: CardInstance[];
}

// ── Active Modifiers ──
export interface ActiveModifier {
  type: CardEffect['type'];
  value: number;
  remainingTurns: number;
  source: string;
}

// ── Candle (price history) ──
export interface Candle {
  slot: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// ── History ──
export interface HistoryEntry {
  slot: number;
  hour: number;
  actor: 'player' | 'opponent' | 'system';
  action: string;
  detail: string;
  priceAfter: number;
}

// ── Game Phase & Mode ──
export type GamePhase = 'setup' | 'playing' | 'finished';
export type GameMode = 'normal' | 'combat';
export type TurnPhase = 'draw' | 'action' | 'settlement' | 'waiting';

// ── Win/Loss ──
export type GameResult = 'win_knockout' | 'win_target' | 'loss_bankrupt' | 'loss_target' | null;

// ── Actions ──
export type GameAction =
  | { type: 'START_GAME'; seed?: number }
  | { type: 'PLAY_CARD'; cardUid: string }
  | { type: 'END_TURN' }
  | { type: 'OPPONENT_ACT' }
  | { type: 'SYSTEM_EVENT'; eventId: string }
  | { type: 'ADVANCE_SLOT' }
  | { type: 'ENTER_COMBAT'; opponentId: string }
  | { type: 'EXIT_COMBAT' };

// ── Settlement ──
export interface SettlementResult {
  previousPrice: number;
  newPrice: number;
  priceDelta: number;
  sentimentEffect: number;
  cardEffect: number;
  eventEffect: number;
  danmaku: DanmakuLine[];
  logs: string[];
}

// ── Game Constants ──
export interface GameConstants {
  totalSlots: number;
  slotsPerHour: number;
  startingPrice: number;
  playerStartingCash: number;
  playerStartingShares: number;
  targetNetWorth: number;
  baseHandLimit: number;
  minHandLimit: number;
  drawdownHandLimitStep: number;
  sentimentMin: number;
  sentimentMax: number;
  sentimentPriceEffect: number;
}

// ── Main Game State ──
export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  turnPhase: TurnPhase;
  slotIndex: number;
  hourIndex: number;
  price: number;
  candles: Candle[];
  sentiment: number;
  player: ActorState;
  opponent: ActorState | null;
  opponentConfig: OpponentConfig | null;
  activeModifiers: ActiveModifier[];
  history: HistoryEntry[];
  backgroundEvent: EventConfig | null;
  result: GameResult;
  constants: GameConstants;
  rngSeed: number;
  currentHandLimit: number;
  combatRound: number;
  danmakuQueue: DanmakuLine[];
}

// ── Default Constants ──
export const DEFAULT_CONSTANTS: GameConstants = {
  totalSlots: 48,
  slotsPerHour: 6,
  startingPrice: 100,
  playerStartingCash: 10000,
  playerStartingShares: 0,
  targetNetWorth: 20000,
  baseHandLimit: 5,
  minHandLimit: 2,
  drawdownHandLimitStep: 0.2,
  sentimentMin: -3,
  sentimentMax: 3,
  sentimentPriceEffect: 0.003,
};
