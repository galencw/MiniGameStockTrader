import type { ActorState, GameConstants, ActiveModifier } from '../game/types';

interface StatusPanelProps {
  player: ActorState;
  constants: GameConstants;
  activeModifiers: ActiveModifier[];
  currentHandLimit: number;
  handSize: number;
}

function formatMoney(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  return value.toFixed(0);
}

function StatusPanel({ player, constants, activeModifiers, currentHandLimit, handSize }: StatusPanelProps) {
  const netWorth = player.netWorth;
  const targetPct = Math.min(100, (netWorth / constants.targetNetWorth) * 100);
  const cashPct = Math.min(100, (player.cash / constants.targetNetWorth) * 100);

  const positionValue = player.shares > 0 ? player.shares * player.averageCost : 0;
  const profitPct = positionValue > 0
    ? ((netWorth - constants.playerStartingCash) / constants.playerStartingCash) * 100
    : 0;

  return (
    <div className="status-panel">
      {/* Net Worth */}
      <div className="stat-row">
        <span className="stat-label">净值 / Net Worth</span>
        <span className={`stat-value font-mono ${netWorth >= constants.targetNetWorth ? 'text-gold' : ''}`}>
          ${formatMoney(netWorth)}
        </span>
      </div>

      {/* Progress to target */}
      <div className="progress-bar">
        <div
          className="progress-fill target"
          style={{ width: `${targetPct}%` }}
        />
      </div>
      <div className="stat-row" style={{ fontSize: '0.7rem' }}>
        <span className="text-muted">目标 / Target: ${formatMoney(constants.targetNetWorth)}</span>
        <span className="text-gold font-mono">{targetPct.toFixed(1)}%</span>
      </div>

      {/* Cash */}
      <div className="stat-row">
        <span className="stat-label">现金 / Cash</span>
        <span className="stat-value font-mono text-buy">${formatMoney(player.cash)}</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill cash"
          style={{ width: `${cashPct}%` }}
        />
      </div>

      {/* Shares */}
      <div className="stat-row">
        <span className="stat-label">持仓 / Shares</span>
        <span className="stat-value font-mono">{player.shares}</span>
      </div>

      {player.averageCost > 0 && (
        <div className="stat-row" style={{ fontSize: '0.7rem' }}>
          <span className="text-muted">均价 / Avg Cost</span>
          <span className="text-muted font-mono">${player.averageCost.toFixed(2)}</span>
        </div>
      )}

      {/* Profit/Loss */}
      <div className="stat-row">
        <span className="stat-label">盈亏 / P&L</span>
        <span className={`stat-value font-mono ${profitPct >= 0 ? 'text-buy' : 'text-sell'}`}>
          {profitPct >= 0 ? '+' : ''}{profitPct.toFixed(1)}%
        </span>
      </div>

      {/* Hand limit */}
      <div className="hand-limit">
        手牌 / Hand: {handSize}/{currentHandLimit}
      </div>

      {/* Active modifiers */}
      {activeModifiers.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          {activeModifiers.map((mod, i) => (
            <div key={i} className="modifier-badge">
              {mod.type}: {mod.value > 0 ? '+' : ''}{mod.value} ({mod.remainingTurns}T)
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatusPanel;