import { useEffect, useState } from 'react';
import type { GameState, GameAction } from '../game/types';
import { CARD_BY_ID } from '../config/cards';
import PriceChart from '../components/PriceChart';
import CardHand from '../components/CardHand';
import DanmakuOverlay from '../components/DanmakuOverlay';
import HistoryPanel from '../components/HistoryPanel';

interface GameScreenProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

function GameScreen({ state, dispatch }: GameScreenProps) {
  const isCombat = state.mode === 'combat';
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);

  // When player ends turn in combat, trigger opponent
  useEffect(() => {
    if (!isCombat || !state.opponent) {
      setWaitingForOpponent(false);
      return;
    }

    if (waitingForOpponent) {
      const timer = setTimeout(() => {
        dispatch({ type: 'OPPONENT_ACT' });
        setWaitingForOpponent(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [waitingForOpponent, isCombat, state.opponent, dispatch]);

  // Filter history: market events (sentiment-related only) and play history
  const marketEvents = state.history.filter(
    (h) => h.actor === 'system' &&
    ['RANDOM_EVENT', 'SYSTEM_EVENT', 'SENTIMENT_EFFECT'].includes(h.action)
  );
  const playHistory = state.history.filter((h) => h.actor !== 'system');

  // Get last played card UIDs for visual state
  const playedUids = new Set(state.player.playedThisTurn.map((c) => c.uid));

  const handleCardClick = (cardUid: string) => {
    if (state.player.cash < getCardCost(cardUid)) return;
    dispatch({ type: 'PLAY_CARD', cardUid });
  };

  function getCardCost(cardUid: string): number {
    const instance = state.player.hand.find((c) => c.uid === cardUid);
    if (!instance) return Infinity;
    const config = CARD_BY_ID.get(instance.configId);
    return config?.cost ?? Infinity;
  }

  // Sentiment bar percentage
  const sentimentPct = ((state.sentiment - state.constants.sentimentMin) /
    (state.constants.sentimentMax - state.constants.sentimentMin)) * 100;
  const sentimentColor = state.sentiment > 0
    ? 'var(--color-buy)'
    : state.sentiment < 0
      ? 'var(--color-sell)'
      : 'var(--accent-primary)';

  return (
    <div className={`game-screen ${isCombat ? 'combat-mode' : ''}`}>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="slot-info">
          <div className="slot-badge">
            第 {state.hourIndex + 1} 小时 / Hour {state.hourIndex + 1}
          </div>
          {isCombat && (
            <div className="slot-badge">
              回合 {state.combatRound + 1}/{state.opponentConfig?.maxCombatRounds}
            </div>
          )}
          <div className={`mode-badge ${isCombat ? 'combat' : 'normal'}`}>
            {isCombat ? '⚔️ 商战模式' : '📈 正常交易'}
          </div>
        </div>

        <div className="sentiment-display">
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>情绪 / Sentiment</span>
          <div className="sentiment-bar">
            <div
              className="sentiment-fill"
              style={{
                width: `${sentimentPct}%`,
                background: sentimentColor,
              }}
            />
          </div>
          <span className={`sentiment-value font-mono`} style={{ color: sentimentColor }}>
            {state.sentiment.toFixed(1)}
          </span>
        </div>

        <div className="target-display">
          <span className="target-label">目标 / Target</span>
          <span className="font-mono">${state.constants.targetNetWorth.toLocaleString()}</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="chart-area">
        <PriceChart
          candles={state.candles}
          currentPrice={state.price}
          constants={state.constants}
          sentiment={state.sentiment}
        />
        <DanmakuOverlay messages={state.danmakuQueue} />
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <HistoryPanel
          entries={marketEvents}
          title="市场事件 / Market Events"
          maxHeight={200}
        />
        <HistoryPanel
          entries={playHistory}
          title="操作记录 / Play History"
          maxHeight={200}
        />
      </div>

      {/* Bottom Panel */}
      <div className="bottom-panel">
        {/* Opponent (bottom-left) */}
        <div className="bottom-left-panel">
          {state.opponent && state.opponentConfig ? (
            <div className="opponent-inline">
              <div className="opponent-avatar-small">
                {state.opponentConfig.avatar === 'small-bear' ? '🐻' :
                 state.opponentConfig.avatar === 'short-fund' ? '💰' : '🧑'}
              </div>
              <div className="opponent-info-compact">
                <div className="opponent-name-small">{state.opponentConfig.name}</div>
                <div className="health-bar">
                  <div className="health-bar-fill" style={{ width: `${Math.max(0, (state.opponent.cash / state.opponentConfig.startingFunds) * 100)}%` }} />
                </div>
                <div className="combat-info-small">⚔️ Round {state.combatRound + 1}</div>
              </div>
            </div>
          ) : (
            <div className="no-opponent">
              <span style={{ opacity: 0.5 }}>等待对手入场...</span>
            </div>
          )}
        </div>

        {/* Card Hand (bottom-center) */}
        <CardHand
          hand={state.player.hand}
          player={state.player}
          playedUids={playedUids}
          onCardClick={handleCardClick}
        />

        {/* Player Info + Actions (bottom-right) */}
        <div className="bottom-right-panel">
          <div className="player-inline">
            <div className="player-avatar-small">👤</div>
            <div className="player-info-compact">
              <div className="player-stat">💰 ${state.player.cash.toLocaleString()}</div>
              <div className="player-stat">📊 {state.player.shares.toFixed(1)} 股</div>
              <div className="player-stat" style={{ color: state.player.netWorth >= state.constants.targetNetWorth ? 'var(--color-buy)' : 'var(--text-primary)' }}>
                净值 ${state.player.netWorth.toLocaleString()}
              </div>
            </div>
          </div>
          <button className="action-btn end-turn" onClick={() => {
            dispatch({ type: 'END_TURN' });
            if (isCombat) setWaitingForOpponent(true);
          }}>
            结束回合
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameScreen;