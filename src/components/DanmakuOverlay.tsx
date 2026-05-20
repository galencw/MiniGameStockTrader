import { useEffect, useRef, useState } from 'react';
import type { DanmakuLine } from '../game/types';

interface DanmakuOverlayProps {
  messages: DanmakuLine[];
}

interface ActiveDanmaku {
  id: number;
  message: DanmakuLine;
  track: number;
  duration: number;
  startedAt: number;
}

const MAX_TRACKS = 3;
const DANMAKU_DURATION_MIN = 10;
const DANMAKU_DURATION_MAX = 14;

function DanmakuOverlay({ messages }: DanmakuOverlayProps) {
  const [activeItems, setActiveItems] = useState<ActiveDanmaku[]>([]);
  const nextIdRef = useRef(0);
  const processedCountRef = useRef(0);

  useEffect(() => {
    const newMessages = messages.slice(processedCountRef.current);
    if (newMessages.length === 0) return;

    const newItems: ActiveDanmaku[] = newMessages.map((msg, i) => {
      const track = (processedCountRef.current + i) % MAX_TRACKS;
      const duration = DANMAKU_DURATION_MIN + Math.random() * (DANMAKU_DURATION_MAX - DANMAKU_DURATION_MIN);

      return {
        id: nextIdRef.current++,
        message: msg,
        track,
        duration,
        startedAt: Date.now(),
      };
    });

    processedCountRef.current = messages.length;
    setActiveItems((prev) => [...prev, ...newItems]);
  }, [messages]);

  useEffect(() => {
    if (activeItems.length === 0) return;

    const timer = setInterval(() => {
      const now = Date.now();
      setActiveItems((prev) =>
        prev.filter((item) => (now - item.startedAt) / 1000 < item.duration)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [activeItems]);

  return (
    <div className="danmaku-overlay">
      {activeItems.map((item) => (
        <div
          key={item.id}
          className={`danmaku-line ${item.message.style ?? 'normal'}`}
          style={{
            top: `${15 + item.track * 30}%`,
            animationDuration: `${item.duration}s`,
          }}
        >
          {item.message.text}
        </div>
      ))}
    </div>
  );
}

export default DanmakuOverlay;
