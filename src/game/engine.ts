import type {
  GameState,
  GameAction,
  GameResult,
  CardInstance,
  CardConfig,
  ActorState,
  ActiveModifier,
  Candle,
  HistoryEntry,
  DanmakuLine,
  OpponentConfig,
  GameConstants,
} from './types';
import { DEFAULT_CONSTANTS } from './types';
import { createRNG } from './rng';
import type { RNG } from './types';
import {
  CARD_BY_ID,
  BACKGROUND_EVENTS,
  RANDOM_EVENTS,
  OPPONENTS,
  OPPONENT_BY_ID,
  INITIAL_DECK_COMPOSITION,
  BASE_DRIFT_PER_SLOT,
  MAX_LEVERAGE_MULTIPLIER,
  MIN_DRAWDOWN_FOR_LIMIT,
  DRAWDOWN_HAND_LIMIT_THRESHOLD,
  COMBAT_END_PRICE_BIAS,
  COMBAT_SURVIVAL_BONUS,
} from '../config';

// ── Helper: UID generation ──────────────────────────────────────────────────

let uidCounter = 0;

function generateUid(): string {
  uidCounter += 1;
  return `card-${Date.now()}-${uidCounter}`;
}

// ── Pure Helper Functions ───────────────────────────────────────────────────

/** Fisher-Yates shuffle (pure — returns a new array) */
export function shuffleDeck(cards: CardInstance[], rng: RNG): CardInstance[] {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/** Build a deck of CardInstances from a composition map (cardId -> count) */
export function buildDeck(composition: Record<string, number>): CardInstance[] {
  const cards: CardInstance[] = [];
  for (const [cardId, count] of Object.entries(composition)) {
    for (let i = 0; i < count; i++) {
      cards.push({ uid: generateUid(), configId: cardId });
    }
  }
  return cards;
}

/** Weighted random selection from an array */
export function weightedRandom<T>(
  items: T[],
  weightFn: (item: T) => number,
  rng: RNG,
): T {
  const totalWeight = items.reduce((sum, item) => sum + weightFn(item), 0);
  let roll = rng.nextFloat(0, totalWeight);
  for (const item of items) {
    roll -= weightFn(item);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

/** Calculate net worth: cash + shares * price */
export function calculateNetWorth(cash: number, shares: number, price: number): number {
  return cash + shares * price;
}

/** Get current leverage multiplier from active modifiers */
export function getLeverageMultiplier(state: GameState): number {
  let multiplier = 1;
  for (const mod of state.activeModifiers) {
    if (mod.type === 'leverage') {
      multiplier *= mod.value;
    }
  }
  return Math.min(multiplier, MAX_LEVERAGE_MULTIPLIER);
}

/** Get volatility multiplier from active modifiers and background event */
function getVolatilityMultiplier(state: GameState): number {
  let multiplier = state.backgroundEvent?.volatilityMultiplier ?? 1;
  for (const mod of state.activeModifiers) {
    if (mod.type === 'volatility_change') {
      multiplier *= mod.value;
    }
  }
  return multiplier;
}

/** Get total price bias from active modifiers */
function getPriceBias(state: GameState): number {
  let bias = 0;
  for (const mod of state.activeModifiers) {
    if (mod.type === 'price_bias') {
      bias += mod.value;
    }
  }
  return bias;
}

/** Calculate hand limit based on drawdown */
export function calculateHandLimit(state: GameState): number {
  const { constants, player } = state;
  const startingNetWorth = constants.playerStartingCash;
  const currentNetWorth = player.netWorth;
  const drawdownPct = Math.max(0, (startingNetWorth - currentNetWorth) / startingNetWorth);

  if (drawdownPct < MIN_DRAWDOWN_FOR_LIMIT) {
    return constants.baseHandLimit;
  }

  const reductionSteps = Math.floor(
    (drawdownPct - MIN_DRAWDOWN_FOR_LIMIT) / DRAWDOWN_HAND_LIMIT_THRESHOLD,
  );
  const newLimit = constants.baseHandLimit - reductionSteps;
  return Math.max(constants.minHandLimit, newLimit);
}

/** Draw cards from deck into hand. Reshuffles discard if deck is empty. */
export function drawCards(
  state: GameState,
  count: number,
  actor: 'player' | 'opponent' = 'player',
): GameState {
  const actorState = actor === 'player' ? state.player : state.opponent;
  if (!actorState) return state;

  let deck = [...actorState.deck];
  let hand = [...actorState.hand];
  let discard = [...actorState.discard];
  const rng = createRNG(state.rngSeed);

  for (let i = 0; i < count; i++) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = shuffleDeck(discard, rng);
      discard = [];
    }
    const card = deck.shift();
    if (card) {
      hand.push(card);
    }
  }

  const newActorState: ActorState = {
    ...actorState,
    deck,
    hand,
    discard,
  };

  // Save the RNG state — we consumed random numbers for shuffle
  const newSeed = rng.nextInt(0, 2147483647);

  if (actor === 'player') {
    return { ...state, player: newActorState, rngSeed: newSeed };
  }
  return { ...state, opponent: newActorState, rngSeed: newSeed };
}

/** Clamp a number between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Clamp sentiment to valid range */
function clampSentiment(sentiment: number, constants: GameConstants): number {
  return clamp(sentiment, constants.sentimentMin, constants.sentimentMax);
}

/** Ensure price stays above minimum */
function clampPrice(price: number): number {
  return Math.max(1, price);
}

/** Check win/loss conditions */
export function checkWinLoss(state: GameState): GameResult {
  const { player, constants, mode, opponent, opponentConfig } = state;

  // Player bankrupt
  if (player.netWorth <= 0) {
    return 'loss_bankrupt';
  }

  // Player reached target net worth
  if (player.netWorth >= constants.targetNetWorth) {
    return 'win_target';
  }

  // Combat-specific checks
  if (mode === 'combat' && opponent && opponentConfig) {
    const opponentNetWorth = calculateNetWorth(opponent.cash, opponent.shares, state.price);
    if (opponentNetWorth <= 0 || opponent.cash <= 0) {
      return 'win_knockout';
    }
  }

  // Game over by time — player didn't reach target
  if (state.slotIndex >= constants.totalSlots) {
    return 'loss_target';
  }

  return null;
}

/** Settle price: combine card impact, sentiment drift, random drift, and modifiers */
export function settlePrice(
  state: GameState,
  cardImpact: number,
  eventBias: number,
): { newPrice: number; sentimentEffect: number; driftEffect: number; biasEffect: number } {
  const rng = createRNG(state.rngSeed);
  const { price, sentiment, constants } = state;
  const volatilityMult = getVolatilityMultiplier(state);

  // Sentiment drift
  const sentimentEffect = sentiment * constants.sentimentPriceEffect * price;

  // Random drift (small random walk)
  const baseDrift = rng.nextFloat(-BASE_DRIFT_PER_SLOT, BASE_DRIFT_PER_SLOT) * price;
  const driftEffect = baseDrift * volatilityMult;

  // Price bias from active modifiers
  const modBias = getPriceBias(state);
  const biasEffect = (modBias / 100) * price + (eventBias / 100) * price;

  const newPrice = clampPrice(price + cardImpact + sentimentEffect + driftEffect + biasEffect);

  return { newPrice, sentimentEffect, driftEffect, biasEffect };
}

/** Decay active modifiers: reduce remaining turns and remove expired ones */
function decayModifiers(modifiers: ActiveModifier[]): ActiveModifier[] {
  return modifiers
    .map((mod) => ({ ...mod, remainingTurns: mod.remainingTurns - 1 }))
    .filter((mod) => mod.remainingTurns > 0);
}

/** Create a candle from price movement */
function createCandle(slot: number, open: number, close: number): Candle {
  return {
    slot,
    open,
    high: Math.max(open, close),
    low: Math.min(open, close),
    close,
  };
}

/** Update actor net worth */
function updateActorNetWorth(actor: ActorState, price: number): ActorState {
  return {
    ...actor,
    netWorth: calculateNetWorth(actor.cash, actor.shares, price),
  };
}

// ── Create Initial State ────────────────────────────────────────────────────

export function createInitialState(seed?: number): GameState {
  const actualSeed = seed ?? Date.now();
  const rng = createRNG(actualSeed);

  // Build player deck from INITIAL_DECK_COMPOSITION
  const deckCards = buildDeck(INITIAL_DECK_COMPOSITION);
  const shuffledDeck = shuffleDeck(deckCards, rng);

  // Deal 5 cards to hand
  const hand = shuffledDeck.slice(0, 5);
  const deck = shuffledDeck.slice(5);

  const constants = { ...DEFAULT_CONSTANTS };
  const startingPrice = constants.startingPrice;

  // Select random background event
  const backgroundEvent = weightedRandom(
    BACKGROUND_EVENTS,
    (e) => e.weight,
    rng,
  );

  // Apply background event sentiment
  const initialSentiment = clampSentiment(
    backgroundEvent.sentimentDelta,
    constants,
  );

  // Save RNG state for future use
  const newSeed = rng.nextInt(0, 2147483647);

  const player: ActorState = {
    cash: constants.playerStartingCash,
    shares: constants.playerStartingShares,
    averageCost: 0,
    netWorth: constants.playerStartingCash,
    deck,
    hand,
    discard: [],
    playedThisTurn: [],
  };

  const initialCandle: Candle = {
    slot: 0,
    open: startingPrice,
    high: startingPrice,
    low: startingPrice,
    close: startingPrice,
  };

  const danmakuQueue: DanmakuLine[] = backgroundEvent.danmakuLines
    ? [...backgroundEvent.danmakuLines]
    : [];

  return {
    phase: 'playing',
    mode: 'normal',
    turnPhase: 'action',
    slotIndex: 0,
    hourIndex: 0,
    price: startingPrice,
    candles: [initialCandle],
    sentiment: initialSentiment,
    player,
    opponent: null,
    opponentConfig: null,
    activeModifiers: [],
    history: [
      {
        slot: 0,
        hour: 0,
        actor: 'system',
        action: 'GAME_START',
        detail: `Game started. Background: ${backgroundEvent.title}. Sentiment: ${initialSentiment}`,
        priceAfter: startingPrice,
      },
    ],
    backgroundEvent,
    result: null,
    constants,
    rngSeed: newSeed,
    currentHandLimit: constants.baseHandLimit,
    combatRound: 0,
    danmakuQueue,
  };
}

// ── Process Card Effects ────────────────────────────────────────────────────

function processCardEffects(
  state: GameState,
  config: CardConfig,
  _leverageMultiplier: number,
): GameState {
  let newState = { ...state };
  let player = { ...newState.player };
  let modifiers = [...newState.activeModifiers];
  let sentiment = newState.sentiment;
  const danmaku = [...newState.danmakuQueue];

  for (const effect of config.effects) {
    switch (effect.type) {
      case 'add_cash': {
        player = { ...player, cash: player.cash + effect.value };
        break;
      }
      case 'add_shares': {
        const newShares = player.shares + effect.value;
        const newAvgCost =
          player.shares === 0
            ? newState.price
            : (player.averageCost * player.shares + newState.price * effect.value) /
              newShares;
        player = { ...player, shares: newShares, averageCost: newAvgCost };
        break;
      }
      case 'heal_drawdown': {
        // Heal drawdown by adding cash equivalent
        const healAmount = (effect.value / 100) * newState.constants.playerStartingCash;
        player = { ...player, cash: player.cash + healAmount };
        break;
      }
      case 'draw_cards': {
        newState = drawCards(
          { ...newState, player },
          effect.value,
          'player',
        );
        player = newState.player;
        break;
      }
      case 'leverage': {
        if (effect.timing === 'immediate' || effect.timing === 'next_card') {
          modifiers.push({
            type: 'leverage',
            value: effect.value,
            remainingTurns: effect.duration ?? 1,
            source: config.id,
          });
        } else if (effect.timing === 'this_turn') {
          modifiers.push({
            type: 'leverage',
            value: effect.value,
            remainingTurns: effect.duration ?? 1,
            source: config.id,
          });
        }
        break;
      }
      case 'sentiment_change': {
        if (effect.timing === 'immediate') {
          sentiment = clampSentiment(
            sentiment + effect.value,
            newState.constants,
          );
        } else {
          modifiers.push({
            type: 'sentiment_change',
            value: effect.value,
            remainingTurns: effect.duration ?? 1,
            source: config.id,
          });
        }
        break;
      }
      case 'price_bias': {
        if (effect.timing === 'immediate') {
          // Apply immediately as price change
          const biasImpact = (effect.value / 100) * newState.price;
          newState = {
            ...newState,
            price: clampPrice(newState.price + biasImpact),
          };
        } else {
          modifiers.push({
            type: 'price_bias',
            value: effect.value,
            remainingTurns: effect.duration ?? 1,
            source: config.id,
          });
        }
        break;
      }
      case 'volatility_change': {
        modifiers.push({
          type: 'volatility_change',
          value: effect.value,
          remainingTurns: effect.duration ?? 1,
          source: config.id,
        });
        break;
      }
    }
  }

  return {
    ...newState,
    player,
    activeModifiers: modifiers,
    sentiment,
    danmakuQueue: danmaku,
  };
}

// ── Apply Action (Main Reducer) ─────────────────────────────────────────────

export function applyAction(state: GameState, action: GameAction): GameState {
  // If game is already finished, don't process further actions
  if (state.phase === 'finished' && action.type !== 'START_GAME') {
    return state;
  }

  switch (action.type) {
    case 'START_GAME':
      return createInitialState(action.seed);

    case 'PLAY_CARD':
      return handlePlayCard(state, action.cardUid);

    case 'END_TURN':
      return handleEndTurn(state);

    case 'OPPONENT_ACT':
      return handleOpponentAct(state);

    case 'ENTER_COMBAT':
      return handleEnterCombat(state, action.opponentId);

    case 'EXIT_COMBAT':
      return handleExitCombat(state);

    case 'SYSTEM_EVENT':
      return handleSystemEvent(state, action.eventId);

    case 'ADVANCE_SLOT':
      return handleEndTurn(state); // Alias

    default:
      return state;
  }
}

// ── PLAY_CARD Handler ───────────────────────────────────────────────────────

function handlePlayCard(state: GameState, cardUid: string): GameState {
  const cardIndex = state.player.hand.findIndex((c) => c.uid === cardUid);
  if (cardIndex === -1) return state;

  const cardInstance = state.player.hand[cardIndex];
  const config = CARD_BY_ID.get(cardInstance.configId);
  if (!config) return state;

  let newState = { ...state };
  let player = { ...newState.player };
  const leverageMult = getLeverageMultiplier(newState);

  // Handle cost and share acquisition for basic buy cards
  if (config.type === 'basic' && config.direction === 'long') {
    if (player.cash < config.cost) return state; // Can't afford

    // Deduct cash
    player = { ...player, cash: player.cash - config.cost };

    // Add shares proportional to cost/price
    const sharesToAdd = (config.cost * leverageMult) / newState.price;
    const newShares = player.shares + sharesToAdd;
    const newAvgCost =
      player.shares === 0
        ? newState.price
        : (player.averageCost * player.shares + newState.price * sharesToAdd) / newShares;
    player = { ...player, shares: newShares, averageCost: newAvgCost };
  }

  // Handle sell cards (direction: neutral with sell tags, or faceValuePct < 0)
  if (config.type === 'basic' && config.direction === 'neutral') {
    // Sell cards restore cash through their effects — handled in processCardEffects
  }

  // Handle short cards (opponent attacking)
  if (config.type === 'basic' && config.direction === 'short') {
    // Short cards push price down, no share/cash change for the player directly
  }

  // Calculate price impact
  const priceImpact =
    (config.priceImpactPct / 100) * newState.price * leverageMult;

  // Apply price change
  const newPrice = clampPrice(newState.price + priceImpact);

  // Apply sentiment delta (clamped)
  const newSentiment = clampSentiment(
    newState.sentiment + config.sentimentDelta,
    newState.constants,
  );

  // Move card from hand to discard
  const newHand = player.hand.filter((c) => c.uid !== cardUid);
  const newDiscard = [...player.discard, cardInstance];
  const newPlayed = [...player.playedThisTurn, cardInstance];
  player = {
    ...player,
    hand: newHand,
    discard: newDiscard,
    playedThisTurn: newPlayed,
  };

  newState = {
    ...newState,
    player,
    price: newPrice,
    sentiment: newSentiment,
  };

  // Process card effects (draw, cash, leverage, etc.)
  newState = processCardEffects(newState, config, leverageMult);

  // Consume leverage modifier if it was "next_card" type
  const updatedModifiers = newState.activeModifiers.map((mod) => {
    if (mod.type === 'leverage' && mod.remainingTurns === 1) {
      return { ...mod, remainingTurns: 0 };
    }
    return mod;
  }).filter((mod) => mod.remainingTurns > 0);
  newState = { ...newState, activeModifiers: updatedModifiers };

  // Update player net worth
  newState = {
    ...newState,
    player: updateActorNetWorth(newState.player, newState.price),
  };

  // In combat mode, settle immediately after each card
  if (newState.mode === 'combat') {
    const settlementResult = settlePrice(newState, 0, 0);
    newState = {
      ...newState,
      price: settlementResult.newPrice,
      rngSeed: createRNG(newState.rngSeed).nextInt(0, 2147483647),
    };
    newState = {
      ...newState,
      player: updateActorNetWorth(newState.player, newState.price),
    };
    if (newState.opponent) {
      newState = {
        ...newState,
        opponent: updateActorNetWorth(newState.opponent, newState.price),
      };
    }
  }

  // Update or create candle for this slot so player card plays are visible on the chart
  const existingCandleIndex = newState.candles.findIndex(c => c.slot === newState.slotIndex);
  if (existingCandleIndex >= 0) {
    const existing = newState.candles[existingCandleIndex];
    const updatedCandle = {
      ...existing,
      close: newState.price,
      high: Math.max(existing.high, newState.price),
      low: Math.min(existing.low, newState.price),
    };
    const newCandles = [...newState.candles];
    newCandles[existingCandleIndex] = updatedCandle;
    newState = { ...newState, candles: newCandles };
  } else {
    const newCandle = { slot: newState.slotIndex, open: state.price, close: newState.price, high: Math.max(state.price, newState.price), low: Math.min(state.price, newState.price) };
    newState = { ...newState, candles: [...newState.candles, newCandle] };
  }

  // Add history entry
  const historyEntry: HistoryEntry = {
    slot: newState.slotIndex,
    hour: newState.hourIndex,
    actor: 'player',
    action: 'PLAY_CARD',
    detail: `Played ${config.name} (impact: ${priceImpact.toFixed(2)})`,
    priceAfter: newState.price,
  };
  newState = {
    ...newState,
    history: [...newState.history, historyEntry],
  };

  // Check win/loss
  const result = checkWinLoss(newState);
  if (result) {
    newState = { ...newState, result, phase: 'finished' };
  }

  return newState;
}

// ── END_TURN Handler ────────────────────────────────────────────────────────

function handleEndTurn(state: GameState): GameState {
  let newState = { ...state };
  const rng = createRNG(newState.rngSeed);
  const openPrice = newState.price;

  // Settlement: apply sentiment drift, random drift, price bias
  const settlement = settlePrice(newState, 0, 0);
  newState = {
    ...newState,
    price: settlement.newPrice,
    rngSeed: rng.nextInt(0, 2147483647),
  };

  // Apply any pending sentiment_change modifiers from 'next_settlement'
  let sentiment = newState.sentiment;
  for (const mod of newState.activeModifiers) {
    if (mod.type === 'sentiment_change') {
      sentiment = clampSentiment(sentiment + mod.value, newState.constants);
    }
  }
  newState = { ...newState, sentiment };

  // Advance slot: normal mode = 6 slots (1 hour), combat mode = 1 slot
  const slotsToAdvance = newState.mode === 'combat' ? 1 : newState.constants.slotsPerHour;
  const newSlotIndex = newState.slotIndex + slotsToAdvance;
  const newHourIndex = Math.floor(newSlotIndex / newState.constants.slotsPerHour);
  const prevHourIndex = newState.hourIndex;

  newState = {
    ...newState,
    slotIndex: newSlotIndex,
    hourIndex: newHourIndex,
  };

  // Create candle from price movement
  const candle = createCandle(newSlotIndex, openPrice, newState.price);
  newState = {
    ...newState,
    candles: [...newState.candles, candle],
  };

  // Decay active modifiers
  newState = {
    ...newState,
    activeModifiers: decayModifiers(newState.activeModifiers),
  };

  // Reset played this turn
  newState = {
    ...newState,
    player: {
      ...newState.player,
      playedThisTurn: [],
    },
  };

  // At hour boundaries: check for random event
  const rng2 = createRNG(newState.rngSeed);
  let danmaku = [...newState.danmakuQueue];

  if (newHourIndex > prevHourIndex && newState.mode === 'normal') {
    // ~30% chance of random event at hour boundary
    const eventRoll = rng2.next();
    if (eventRoll < 0.3) {
      const event = weightedRandom(RANDOM_EVENTS, (e) => e.weight, rng2);
      // Apply event effects
      const eventSentiment = clampSentiment(
        newState.sentiment + event.sentimentDelta,
        newState.constants,
      );
      const eventPriceBias = (event.priceBiasPct / 100) * newState.price;
      const eventPrice = clampPrice(newState.price + eventPriceBias);

      // Add event modifiers
      const eventModifiers: ActiveModifier[] = [];
      if (event.volatilityMultiplier !== 1) {
        eventModifiers.push({
          type: 'volatility_change',
          value: event.volatilityMultiplier,
          remainingTurns: 3, // Events last ~3 turns
          source: event.id,
        });
      }

      newState = {
        ...newState,
        price: eventPrice,
        sentiment: eventSentiment,
        activeModifiers: [...newState.activeModifiers, ...eventModifiers],
      };

      // Add danmaku from event
      danmaku = [...danmaku, ...event.danmakuLines];

      // History entry for event
      const eventHistory: HistoryEntry = {
        slot: newState.slotIndex,
        hour: newState.hourIndex,
        actor: 'system',
        action: 'RANDOM_EVENT',
        detail: `${event.title}: ${event.description}`,
        priceAfter: newState.price,
      };
      newState = {
        ...newState,
        history: [...newState.history, eventHistory],
      };
    }

    // Check combat trigger (only in normal mode)
    if (newState.mode === 'normal') {
      const combatRoll = rng2.next();
      let triggerProbability = 0;
      let selectedOpponent: OpponentConfig | null = null;

      // Check each opponent's trigger windows
      for (const opp of OPPONENTS) {
        for (const window of opp.triggerWindows) {
          if (newHourIndex >= window.hourStart && newHourIndex <= window.hourEnd) {
            if (window.probability > triggerProbability) {
              triggerProbability = window.probability;
              selectedOpponent = opp;
            }
          }
        }
      }

      if (selectedOpponent && combatRoll < triggerProbability) {
        newState = handleEnterCombat(newState, selectedOpponent.id);
      }
    }
  }

  newState = {
    ...newState,
    rngSeed: rng2.nextInt(0, 2147483647),
    danmakuQueue: danmaku,
  };

  // Update player net worth
  newState = {
    ...newState,
    player: updateActorNetWorth(newState.player, newState.price),
  };
  if (newState.opponent) {
    newState = {
      ...newState,
      opponent: updateActorNetWorth(newState.opponent, newState.price),
    };
  }

  // Recalculate hand limit
  const newHandLimit = calculateHandLimit(newState);
  newState = { ...newState, currentHandLimit: newHandLimit };

  // Draw cards up to hand limit
  const cardsToDraw = Math.max(0, newState.currentHandLimit - newState.player.hand.length);
  if (cardsToDraw > 0) {
    newState = drawCards(newState, cardsToDraw, 'player');
  }

  // Add settlement sentiment info to history if sentiment is non-zero
  if (newState.sentiment !== 0) {
    const sentimentHistory: HistoryEntry = {
      slot: newState.slotIndex,
      hour: newState.hourIndex,
      actor: 'system',
      action: 'SENTIMENT_EFFECT',
      detail: `市场情绪 ${newState.sentiment > 0 ? '利多' : '利空'} (${newState.sentiment > 0 ? '+' : ''}${(settlement.sentimentEffect).toFixed(2)})`,
      priceAfter: newState.price,
    };
    newState = { ...newState, history: [...newState.history, sentimentHistory] };
  }

  // Generate ambient market chatter danmaku
  const ambientRng = createRNG(newState.rngSeed + newState.slotIndex);
  const ambientDanmaku: DanmakuLine[] = [...newState.danmakuQueue];
  const priceChangeFromStart = ((newState.price - newState.constants.startingPrice) / newState.constants.startingPrice) * 100;
  if (ambientRng.next() < 0.6) {
    const chatterPool: DanmakuLine[] = priceChangeFromStart > 5
      ? [
          { text: '涨涨涨！停不下来！', style: 'highlight' },
          { text: '今天赚麻了兄弟们', style: 'normal' },
          { text: '还能涨吗？有点慌', style: 'normal' },
          { text: '这行情太猛了吧', style: 'highlight' },
        ]
      : priceChangeFromStart < -5
      ? [
          { text: '跌麻了……', style: 'warning' },
          { text: '谁来救救我', style: 'warning' },
          { text: '早知道不开盘了', style: 'normal' },
          { text: '抄底的勇士在哪里', style: 'normal' },
        ]
      : [
          { text: '今天行情一般般啊', style: 'normal' },
          { text: '观望观望再说', style: 'normal' },
          { text: '有点无聊 来点大新闻', style: 'normal' },
          { text: '稳住别慌 还有机会', style: 'normal' },
        ];
    const picked = chatterPool[ambientRng.nextInt(0, chatterPool.length - 1)];
    ambientDanmaku.push(picked);
  }
  newState = { ...newState, danmakuQueue: ambientDanmaku, rngSeed: ambientRng.nextInt(0, 2147483647) };

  // Add history entry for end of turn
  const turnHistory: HistoryEntry = {
    slot: newState.slotIndex,
    hour: newState.hourIndex,
    actor: 'system',
    action: 'END_TURN',
    detail: `Turn ended. Price: ${newState.price.toFixed(2)}, Sentiment: ${newState.sentiment}`,
    priceAfter: newState.price,
  };
  newState = {
    ...newState,
    history: [...newState.history, turnHistory],
  };

  // Check win/loss
  const result = checkWinLoss(newState);
  if (result) {
    newState = { ...newState, result, phase: 'finished' };
  }

  return newState;
}

// ── OPPONENT_ACT Handler ────────────────────────────────────────────────────

function handleOpponentAct(state: GameState): GameState {
  if (state.mode !== 'combat' || !state.opponent || !state.opponentConfig) {
    return state;
  }

  // Import selectOpponentCard — we call it via the function directly
  // to avoid circular dependency we implement inline logic here that
  // mirrors the AI. The actual selectOpponentCard is exported from opponentAI.ts
  // but for the engine we need a reference. We'll use a simplified version.
  const opponent = state.opponent;
  const opponentConfig = state.opponentConfig;

  // Select best card from opponent hand (simplified scoring inline)
  let bestCard: CardInstance | null = null;
  let bestScore = -1;

  for (const cardInst of opponent.hand) {
    const config = CARD_BY_ID.get(cardInst.configId);
    if (!config) continue;

    let score = config.aiWeight;

    // Can't afford check
    if (config.cost > opponent.cash) {
      score = 0;
      continue;
    }

    // Policy weights
    const playerPositionValue = state.player.shares * state.price;
    if (playerPositionValue > 5000 && config.direction === 'short') {
      score *= 1 + opponentConfig.policyWeights.pressWhenPlayerPositionHigh;
    }
    if (state.sentiment < 0 && config.direction === 'short') {
      score *= 1 + opponentConfig.policyWeights.pressWhenSentimentNegative;
    }
    if (opponent.cash < 3000 && (config.type === 'skill')) {
      score *= 1 + opponentConfig.policyWeights.conserveWhenFundsLow;
    }
    if (state.player.cash < 2000 && config.type === 'event') {
      score *= 1 + opponentConfig.policyWeights.eventWhenPlayerCashLow;
    }

    // If opponent cash is running low (< 30% of starting), prefer recovery/buy cards
    if (opponent.cash < opponentConfig.startingFunds * 0.3 && config.direction !== 'short') {
      score *= 1.5;
    }

    // Occasionally prefer non-short cards for variety (15% chance per card)
    const cardIndex = opponent.hand.indexOf(cardInst);
    const rngForVariety = createRNG(state.rngSeed + cardIndex);
    if (config.direction !== 'short' && rngForVariety.next() < 0.15 * (1 + opponentConfig.conservatism)) {
      score *= 2; // Boost non-short cards occasionally
    }

    if (score > bestScore) {
      bestScore = score;
      bestCard = cardInst;
    }
  }

  if (!bestCard) return state;

  const selectedConfig = CARD_BY_ID.get(bestCard.configId);
  if (!selectedConfig) return state;

  let newState = { ...state };
  let newOpponent = { ...opponent };

  // Deduct opponent cash for cost
  newOpponent = { ...newOpponent, cash: newOpponent.cash - selectedConfig.cost };

  // Apply opponent card effect (short direction — price goes down)
  const priceImpact =
    (selectedConfig.priceImpactPct / 100) * newState.price;
  const newPrice = clampPrice(newState.price + priceImpact);

  // Apply sentiment delta
  const newSentiment = clampSentiment(
    newState.sentiment + selectedConfig.sentimentDelta,
    newState.constants,
  );

  // Move card from opponent hand to discard
  const newOppHand = newOpponent.hand.filter((c) => c.uid !== bestCard!.uid);
  const newOppDiscard = [...newOpponent.discard, bestCard];
  const newOppPlayed = [...newOpponent.playedThisTurn, bestCard];
  newOpponent = {
    ...newOpponent,
    hand: newOppHand,
    discard: newOppDiscard,
    playedThisTurn: newOppPlayed,
  };

  newState = {
    ...newState,
    price: newPrice,
    sentiment: newSentiment,
    opponent: newOpponent,
  };

  // Settle price immediately
  const rng = createRNG(newState.rngSeed);
  const settlementResult = settlePrice(newState, 0, 0);
  newState = {
    ...newState,
    price: settlementResult.newPrice,
    rngSeed: rng.nextInt(0, 2147483647),
  };

  // Advance combat round and 1 slot
  const newCombatRound = newState.combatRound + 1;
  const newSlotIndex = newState.slotIndex + 1;
  const newHourIndex = Math.floor(newSlotIndex / newState.constants.slotsPerHour);

  newState = {
    ...newState,
    combatRound: newCombatRound,
    slotIndex: newSlotIndex,
    hourIndex: newHourIndex,
  };

  // Create candle
  const candle = createCandle(newSlotIndex, state.price, newState.price);
  newState = {
    ...newState,
    candles: [...newState.candles, candle],
  };

  // Update net worths
  newState = {
    ...newState,
    player: updateActorNetWorth(newState.player, newState.price),
    opponent: updateActorNetWorth(newState.opponent!, newState.price),
  };

  // History entry
  const historyEntry: HistoryEntry = {
    slot: newState.slotIndex,
    hour: newState.hourIndex,
    actor: 'opponent',
    action: 'OPPONENT_ACT',
    detail: `${newState.opponentConfig!.name} played ${selectedConfig.name} (impact: ${priceImpact.toFixed(2)})`,
    priceAfter: newState.price,
  };
  newState = {
    ...newState,
    history: [...newState.history, historyEntry],
  };

  // Check if opponent funds <= 0 → win_knockout
  if (newState.opponent!.cash <= 0) {
    return {
      ...newState,
      result: 'win_knockout',
      phase: 'finished',
    };
  }

  // Check if player netWorth <= 0 → loss_bankrupt
  if (newState.player.netWorth <= 0) {
    return {
      ...newState,
      result: 'loss_bankrupt',
      phase: 'finished',
    };
  }

  // Check if combatRound >= maxCombatRounds → exit combat
  if (newCombatRound >= newState.opponentConfig!.maxCombatRounds) {
    newState = handleExitCombat(newState);
  }

  // Draw 1 card for opponent (not fill to 5)
  if (newState.opponent && newState.mode === 'combat') {
    if (newState.opponent.hand.length < 3) {
      newState = drawCards(newState, 1, 'opponent');
    }
  }

  return newState;
}

// ── ENTER_COMBAT Handler ────────────────────────────────────────────────────

function handleEnterCombat(state: GameState, opponentId: string): GameState {
  const oppConfig = OPPONENT_BY_ID.get(opponentId);
  if (!oppConfig) return state;

  const rng = createRNG(state.rngSeed);

  // Build opponent deck from config
  const deckComposition: Record<string, number> = {};
  for (const cardId of oppConfig.deckCardIds) {
    deckComposition[cardId] = (deckComposition[cardId] ?? 0) + 1;
  }
  const oppDeck = buildDeck(deckComposition);
  const shuffledOppDeck = shuffleDeck(oppDeck, rng);

  // Deal hand (up to 5 cards)
  const handSize = Math.min(5, shuffledOppDeck.length);
  const oppHand = shuffledOppDeck.slice(0, handSize);
  const oppDeckRemaining = shuffledOppDeck.slice(handSize);

  const opponentState: ActorState = {
    cash: oppConfig.startingFunds,
    shares: 0,
    averageCost: 0,
    netWorth: oppConfig.startingFunds,
    deck: oppDeckRemaining,
    hand: oppHand,
    discard: [],
    playedThisTurn: [],
  };

  const newSeed = rng.nextInt(0, 2147483647);

  const historyEntry: HistoryEntry = {
    slot: state.slotIndex,
    hour: state.hourIndex,
    actor: 'system',
    action: 'ENTER_COMBAT',
    detail: `Combat started against ${oppConfig.name}!`,
    priceAfter: state.price,
  };

  const danmaku: DanmakuLine[] = [
    { text: `${oppConfig.name} 出现了！准备迎战！`, style: 'warning' },
    { text: '空头来袭！保护你的仓位！', style: 'warning' },
  ];

  return {
    ...state,
    mode: 'combat',
    combatRound: 0,
    opponent: opponentState,
    opponentConfig: oppConfig,
    rngSeed: newSeed,
    history: [...state.history, historyEntry],
    danmakuQueue: [...state.danmakuQueue, ...danmaku],
  };
}

// ── EXIT_COMBAT Handler ─────────────────────────────────────────────────────

function handleExitCombat(state: GameState): GameState {
  const historyEntry: HistoryEntry = {
    slot: state.slotIndex,
    hour: state.hourIndex,
    actor: 'system',
    action: 'EXIT_COMBAT',
    detail: `Combat ended. ${state.opponentConfig?.name ?? 'Opponent'} retreated.`,
    priceAfter: state.price,
  };

  // Apply survival bonus
  const newCash = state.player.cash + COMBAT_SURVIVAL_BONUS;
  const newPlayer = updateActorNetWorth(
    { ...state.player, cash: newCash },
    state.price,
  );

  // Apply price recovery bias
  const recoveryBias = (COMBAT_END_PRICE_BIAS / 100) * state.price;
  const newPrice = clampPrice(state.price + recoveryBias);

  const danmaku: DanmakuLine[] = [
    { text: '空头撤退了！多头保卫战胜利！', style: 'highlight' },
    { text: `获得生存奖金 +${COMBAT_SURVIVAL_BONUS}`, style: 'highlight' },
  ];

  return {
    ...state,
    mode: 'normal',
    combatRound: 0,
    opponent: null,
    opponentConfig: null,
    player: updateActorNetWorth(newPlayer, newPrice),
    price: newPrice,
    history: [...state.history, historyEntry],
    danmakuQueue: [...state.danmakuQueue, ...danmaku],
  };
}

// ── SYSTEM_EVENT Handler ────────────────────────────────────────────────────

function handleSystemEvent(state: GameState, eventId: string): GameState {
  const event = [...RANDOM_EVENTS, ...BACKGROUND_EVENTS].find(
    (e) => e.id === eventId,
  );
  if (!event) return state;

  const eventPriceBias = (event.priceBiasPct / 100) * state.price;
  const newPrice = clampPrice(state.price + eventPriceBias);
  const newSentiment = clampSentiment(
    state.sentiment + event.sentimentDelta,
    state.constants,
  );

  const eventModifiers: ActiveModifier[] = [];
  if (event.volatilityMultiplier !== 1) {
    eventModifiers.push({
      type: 'volatility_change',
      value: event.volatilityMultiplier,
      remainingTurns: 3,
      source: event.id,
    });
  }

  const historyEntry: HistoryEntry = {
    slot: state.slotIndex,
    hour: state.hourIndex,
    actor: 'system',
    action: 'SYSTEM_EVENT',
    detail: `${event.title}: ${event.description}`,
    priceAfter: newPrice,
  };

  return {
    ...state,
    price: newPrice,
    sentiment: newSentiment,
    activeModifiers: [...state.activeModifiers, ...eventModifiers],
    history: [...state.history, historyEntry],
    danmakuQueue: [...state.danmakuQueue, ...event.danmakuLines],
    player: updateActorNetWorth(state.player, newPrice),
    opponent: state.opponent
      ? updateActorNetWorth(state.opponent, newPrice)
      : null,
  };
}
