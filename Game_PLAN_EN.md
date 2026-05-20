# MiniGameStockTrader HTML5 MVP Plan

## Summary
- Build a **single-player HTML5 stock-card battle game** as a static resource package using **Vite + React + TypeScript**.
- MVP priority is **playable numeric loop**: 48 time slots, stock price, market sentiment, cards, opponent, combat mode, win/loss, result settlement.
- All gameplay data should be **config-driven** so different AI agents can safely work in parallel on engine, UI, content, and testing.
- No backend, no real stock API, no external runtime assets. Final output is `dist/` static files and optional zip package.

## Core Game Rules
- One game lasts **8 market hours**, represented internally as **48 ten-minute slots**.
- Normal mode:
  - Player acts once per market hour.
  - One normal turn consumes 6 ten-minute slots.
  - Only player card effects directly affect the stock price.
- Combat mode:
  - Triggered by scripted windows plus probability.
  - Each combat round consumes 1 ten-minute slot.
  - Player acts first, price settles immediately, then opponent acts, price settles again.
  - Player is always long-biased; opponent is always short-biased.
- Win conditions:
  - Opponent funds reach `0`.
  - Or game ends after 48 slots and player net worth reaches configured target.
- Loss conditions:
  - Player funds/net worth reach `0`.
  - Or game ends after 48 slots below target.
- Recommended initial tuning:
  - Starting price: `100`.
  - Player starting capital: `1000`, split into `600 cash + 400 stock position`.
  - Target ending net worth: `1200`.
  - Base hand limit: `5`.
  - Every `20%` drawdown reduces hand limit by `1`, minimum `2`.

## Gameplay Systems
- Card types:
  - `basic`: buy/sell cards that affect price and consume or restore cash.
  - `skill`: modifies pre-play state, such as add cash, add position, heal drawdown, draw cards, or apply leverage.
  - `event`: humorous market event card; no cash cost, affects next settlement price or sentiment.
- Basic card formula:
  - Example default: face value `20%` produces `2%` price impact.
  - Formula: `priceImpactPct = faceValuePct * 0.1 * leverageMultiplier`.
- Market sentiment:
  - Stored as a small signed value, for example `-3` to `+3`.
  - Every settlement applies minor automatic drift to price.
  - Hourly random events can change sentiment and create danmaku text.
- Background event:
  - One event is selected at game start.
  - It sets the day’s trend bias, volatility, and opening flavor text.
- Opponent AI:
  - Configurable opponent profile with funds, deck, aggression, trigger windows, and decision weights.
  - Opponent card choices prioritize short pressure when player position value is high or market is already falling.

## Technical Design
- Main state shape:
  - `GameState`: phase, mode, slot index, hour index, price, candles, sentiment, histories, player, opponent, active modifiers, RNG seed.
  - `ActorState`: cash, shares/exposure, average cost, net worth, deck, hand, discard, played cards.
  - `CardConfig`: id, name, type, direction, cost, face value, price impact, sentiment delta, effects, tags, AI weight.
  - `EventConfig`: id, title, description, sentiment delta, price bias, danmaku lines, weight.
  - `OpponentConfig`: id, name, starting funds, trigger rules, deck ids, policy weights.
- Engine should be deterministic:
  - Use seeded RNG.
  - Implement state transitions through pure functions such as `applyAction(state, action)`.
  - Keep card configs separate from runtime state.
- UI layout follows the reference image:
  - First use whiteboard sketches or temp assets from the asset library.
  - Main candlestick chart with danmaku overlay.
  - Right-side play history and event history.
  - Bottom player/opponent areas with avatar, cash bar, position/net-worth bar.
  - Center-bottom player hand and action controls.
  - End screen shows final price, profit/loss, opponent result, and key events.

## AI Agent Split
- Agent 1: Engine
  - Owns TypeScript gameplay types, reducer/state machine, turn clock, price settlement, win/loss checks, seeded RNG.
  - Does not touch visual components except integration contracts.
- Agent 2: Cards, Events, Balance
  - Owns card configs, event configs, opponent configs, and numeric tuning.
  - Creates enough content for a full 8-hour run.
- Agent 3: React UI
  - Owns layout, chart, card hand, action buttons, history panels, danmaku, start/end screens.
  - Consumes engine state and dispatches engine actions only.
- Agent 4: QA and Packaging
  - Owns unit tests, simulation tests, Playwright smoke tests, build verification, offline asset check, and final zip packaging.
- Integration rule:
  - Agents coordinate through shared `types` and config contracts.
  - Engine APIs are stabilized before UI/content agents depend on them.

## Assumptions
- First version uses **fictional stock data only**.
- First version is **desktop-first 16:9**, with responsive scaling but not full mobile redesign.
- Visual assets can be simple local generated/handmade assets in MVP.
- No persistent progression system in MVP; optional localStorage only for settings or last seed.
- The first playable target is one complete run, not multiple levels or roguelike meta-progression.
