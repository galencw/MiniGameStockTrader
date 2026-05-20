import { useEffect, useRef } from 'react';
import type { HistoryEntry } from '../game/types';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  title?: string;
  maxHeight?: number;
}

function formatSlotHour(slot: number, hour: number): string {
  return `S${slot} H${hour}`;
}

function HistoryPanel({ entries, title = '事件记录 / Events', maxHeight }: HistoryPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [entries.length]);

  const style = maxHeight ? { maxHeight: `${maxHeight}px` } : undefined;

  return (
    <div className="panel-section">
      <div className="panel-title">{title}</div>
      <div className="history-list" ref={listRef} style={style}>
        {entries.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', padding: '8px' }}>
            No events yet...
          </div>
        ) : (
          entries.map((entry, i) => (
            <div key={`${entry.slot}-${i}`} className="history-entry">
              <div className="entry-time">{formatSlotHour(entry.slot, entry.hour)}</div>
              <div className={`entry-actor ${entry.actor}`}>
                {entry.actor === 'player' ? '🎮' :
                 entry.actor === 'opponent' ? '🐺' :
                 '📢'} {entry.action}
              </div>
              <div className="entry-detail">{entry.detail}</div>
              {entry.priceAfter > 0 && (
                <div className="entry-price">Price: ${entry.priceAfter.toFixed(2)}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HistoryPanel;