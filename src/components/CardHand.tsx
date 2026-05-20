import type { CardInstance, ActorState } from '../game/types';
import CardDisplay from './CardDisplay';

interface CardHandProps {
  hand: CardInstance[];
  player: ActorState;
  selectedUid?: string | null;
  playedUids?: Set<string>;
  onCardClick?: (uid: string) => void;
}

function CardHand({ hand, player, selectedUid, playedUids, onCardClick }: CardHandProps) {
  const playedSet = playedUids ?? new Set<string>();

  return (
    <div className="card-hand-area">
      {hand.map((card) => {
        const isPlayed = playedSet.has(card.uid);
        const isSelected = selectedUid === card.uid;
        const visualState = isPlayed ? 'played' : isSelected ? 'selected' : 'normal';

        return (
          <CardDisplay
            key={card.uid}
            instance={card}
            visualState={visualState}
            playerCash={player.cash}
            onClick={onCardClick}
          />
        );
      })}
    </div>
  );
}

export default CardHand;