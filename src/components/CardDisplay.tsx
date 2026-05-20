import type { CardConfig, CardInstance, CardType, CardDirection } from '../game/types';
import { CARD_BY_ID } from '../config/cards';

type CardVisualState = 'normal' | 'selected' | 'disabled' | 'played';

interface CardDisplayProps {
  instance: CardInstance;
  visualState?: CardVisualState;
  playerCash?: number;
  onClick?: (uid: string) => void;
}

function getTypeClass(type: CardType, direction: CardDirection): string {
  if (type === 'skill') return 'skill';
  if (type === 'event') return 'event';
  // basic cards vary by direction
  if (direction === 'long') return 'basic-long';
  if (direction === 'short') return 'basic-short';
  return 'basic-neutral';
}

function getTypeLabel(type: CardType, direction: CardDirection): string {
  if (type === 'skill') return 'SK';
  if (type === 'event') return 'EV';
  if (direction === 'long') return 'BUY';
  if (direction === 'short') return 'SHORT';
  return 'SELL';
}

function getDirectionArrow(direction: CardDirection): string {
  if (direction === 'long') return '↑'; // up arrow
  if (direction === 'short') return '↓'; // down arrow
  return '↕'; // up-down arrow
}

function formatCost(cost: number): string {
  if (cost === 0) return 'FREE';
  return `-$${cost}`;
}

function formatEffects(config: CardConfig): string {
  const parts: string[] = [];
  for (const eff of config.effects) {
    switch (eff.type) {
      case 'add_cash':
        parts.push(`+${eff.value > 0 ? '' : ''}$${eff.value}`);
        break;
      case 'add_shares':
        parts.push(`+${eff.value} shares`);
        break;
      case 'heal_drawdown':
        parts.push(`heal ${eff.value}%`);
        break;
      case 'draw_cards':
        parts.push(`draw ${eff.value}`);
        break;
      case 'leverage':
        parts.push(`x${eff.value} leverage`);
        break;
      case 'sentiment_change':
        parts.push(`sentiment ${eff.value > 0 ? '+' : ''}${eff.value}`);
        break;
      case 'price_bias':
        parts.push(`price ${eff.value > 0 ? '+' : ''}${eff.value}%`);
        break;
      case 'volatility_change':
        parts.push(`volatility x${eff.value}`);
        break;
    }
  }
  if (config.priceImpactPct !== 0) {
    parts.push(`impact ${config.priceImpactPct > 0 ? '+' : ''}${config.priceImpactPct}%`);
  }
  return parts.join(' | ');
}

function formatRarity(rarity: string): string {
  switch (rarity) {
    case 'common': return '●';
    case 'uncommon': return '◆';
    case 'rare': return '★';
    default: return '●';
  }
}

function CardDisplay({ instance, visualState = 'normal', playerCash, onClick }: CardDisplayProps) {
  const config = CARD_BY_ID.get(instance.configId);
  if (!config) {
    return (
      <div className="card-display disabled">
        <div className="card-name">Unknown Card</div>
      </div>
    );
  }

  const typeClass = getTypeClass(config.type, config.direction);
  const isAffordable = playerCash !== undefined ? playerCash >= config.cost : true;
  const effectiveState = visualState === 'normal' && !isAffordable ? 'disabled' : visualState;

  const stateClass = effectiveState === 'disabled' ? 'disabled' : effectiveState === 'played' ? 'played' : '';

  const handleClick = () => {
    if (onClick && effectiveState !== 'disabled' && effectiveState !== 'played') {
      onClick(instance.uid);
    }
  };

  return (
    <div
      className={`card-display ${typeClass} ${stateClass}`}
      onClick={handleClick}
      role="button"
      tabIndex={effectiveState === 'disabled' || effectiveState === 'played' ? -1 : 0}
      aria-label={`${config.name} - cost: ${config.cost}`}
    >
      {/* Top color stripe via ::before */}
      <div className="card-type-icon">
        {getTypeLabel(config.type, config.direction)} {getDirectionArrow(config.direction)}
      </div>

      <div className="card-name">{config.name}</div>

      <div className={`card-cost ${config.cost === 0 ? 'free' : ''}`}>
        {formatCost(config.cost)}
      </div>

      <div className="card-effect">{formatEffects(config)}</div>

      <div className={`card-rarity ${config.rarity}`}>
        {formatRarity(config.rarity)} {config.rarity}
      </div>

      {/* Hover tooltip with full description */}
      <div className="card-tooltip">{config.description}</div>
    </div>
  );
}

export default CardDisplay;