import type { GameState, GameResult } from '../game/types';

interface EndScreenProps {
  state: GameState;
  onPlayAgain: () => void;
}

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getResultLabel(result: GameResult): { text: string; className: string } {
  if (!result) return { text: 'Game Over', className: 'loss' };
  switch (result) {
    case 'win_knockout':
      return { text: '击败空头! / Knockout Win!', className: 'win' };
    case 'win_target':
      return { text: '达标胜利! / Target Reached!', className: 'win' };
    case 'loss_bankrupt':
      return { text: '破产出局! / Bankrupt!', className: 'loss' };
    case 'loss_target':
      return { text: '未达标! / Target Missed', className: 'loss' };
    default:
      return { text: 'Game Over', className: 'loss' };
  }
}

function EndScreen({ state, onPlayAgain }: EndScreenProps) {
  const resultInfo = getResultLabel(state.result);
  const profit = state.player.netWorth - state.constants.playerStartingCash;
  const profitPct = (profit / state.constants.playerStartingCash) * 100;

  // Collect key events from history
  const keyEvents = state.history
    .filter((h) => h.actor === 'system')
    .slice(-8);

  // Collect player key actions
  const keyActions = state.history
    .filter((h) => h.actor === 'player')
    .slice(-5);

  return (
    <div className="end-screen">
      <div className={`result-banner ${resultInfo.className}`}>
        {resultInfo.text}
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">最终价格 / Final Price</span>
          <span className="stat-value font-mono" style={{ color: state.price >= state.constants.startingPrice ? 'var(--color-buy)' : 'var(--color-sell)' }}>
            ${state.price.toFixed(2)}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">最终净值 / Net worth</span>
          <span className={`stat-value font-mono ${state.player.netWorth >= state.constants.targetNetWorth ? 'text-gold' : ''}`}>
            ${formatMoney(state.player.netWorth)}
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">盈亏 / Profit/Loss</span>
          <span className={`stat-value font-mono ${profit >= 0 ? 'text-buy' : 'text-sell'}`}>
            ${formatMoney(profit)} ({profitPct >= 0 ? '+' : ''}{profitPct.toFixed(1)}%)
          </span>
        </div>

        <div className="stat-item">
          <span className="stat-label">总回合 / Total slots</span>
          <span className="stat-value font-mono">{state.slotIndex}/{state.constants.totalSlots}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">现金 / Cash</span>
          <span className="stat-value font-mono text-buy">${formatMoney(state.player.cash)}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">持仓 / Shares</span>
          <span className="stat-value font-mono">{state.player.shares}</span>
        </div>
      </div>

      {/* Key Events */}
      {keyEvents.length > 0 && (
        <div className="events-summary">
          <h3>关键事件 / Key Events</h3>
          {keyEvents.map((e, i) => (
            <div key={i} className="event-item">
              H{e.hour} - {e.action}: {e.detail}
            </div>
          ))}
        </div>
      )}

      {/* Key Actions */}
      {keyActions.length > 0 && (
        <div className="events-summary">
          <h3>关键操作 / Key Actions</h3>
          {keyActions.map((a, i) => (
            <div key={i} className="event-item">
              H{a.hour} - {a.action}: {a.detail} (Price: ${a.priceAfter.toFixed(2)})
            </div>
          ))}
        </div>
      )}

      <button className="play-again-btn" onClick={onPlayAgain}>
        再来一局 / Play Again
      </button>
    </div>
  );
}

export default EndScreen;