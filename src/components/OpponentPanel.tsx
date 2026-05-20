import type { ActorState, OpponentConfig, HistoryEntry } from '../game/types';

interface OpponentPanelProps {
  opponent: ActorState;
  opponentConfig: OpponentConfig;
  combatRound: number;
  lastHistory?: HistoryEntry[];
}

function formatMoney(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  return value.toFixed(0);
}

function OpponentPanel({ opponent, opponentConfig, combatRound, lastHistory }: OpponentPanelProps) {
  // Find opponent's last action from history
  const opponentAction = lastHistory
    ?.filter((h) => h.actor === 'opponent')
    ?.slice(-1)[0];

  return (
    <div className="opponent-panel">
      <div className="opponent-header">
        <div className="opponent-avatar">
          {opponentConfig.avatar === 'small-bear' ? '🐻' :
           opponentConfig.avatar === 'short-fund' ? '💰' :
           opponentConfig.avatar === 'quant-boss' ? '🧑' : '🐺'}
        </div>
        <div>
          <div className="opponent-name">{opponentConfig.name}</div>
        </div>
      </div>

      <div className="opponent-funds">
        Funds: ${formatMoney(opponent.cash)} | Shares: {opponent.shares}
      </div>

      <div className="combat-round">
        Combat Round: {combatRound}/{opponentConfig.maxCombatRounds}
      </div>

      {opponentAction && (
        <div className="opponent-action">
          Last: {opponentAction.action} - {opponentAction.detail}
        </div>
      )}
    </div>
  );
}

export default OpponentPanel;