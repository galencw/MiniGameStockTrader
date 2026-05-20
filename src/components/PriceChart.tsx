import { useEffect, useRef, useState, useCallback } from 'react';
import type { Candle, GameConstants } from '../game/types';

interface PriceChartProps {
  candles: Candle[];
  currentPrice: number;
  constants: GameConstants;
  sentiment: number;
}

const CHART_PADDING = { top: 24, right: 60, bottom: 30, left: 50 };

function PriceChart({ candles, currentPrice, constants, sentiment }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const computeChart = useCallback(() => {
    if (candles.length === 0) {
      return {
        xScale: (_slot: number) => 0,
        yScale: (_price: number) => 0,
        minPrice: constants.startingPrice * 0.5,
        maxPrice: constants.startingPrice * 1.5,
        visibleSlots: 0,
      };
    }

    const chartW = dimensions.width - CHART_PADDING.left - CHART_PADDING.right;
    const chartH = dimensions.height - CHART_PADDING.top - CHART_PADDING.bottom;

    // Compute price range
    const allPrices = candles.flatMap((c) => [c.low, c.high]);
    const minPrice = Math.min(...allPrices) * 0.95;
    const maxPrice = Math.max(...allPrices) * 1.05;
    const priceRange = maxPrice - minPrice || 1;

    // Compute slot range
    const totalSlots = constants.totalSlots;
    const visibleSlots = Math.max(candles.length, 1);

    const xScale = (slot: number) =>
      CHART_PADDING.left + (slot / totalSlots) * chartW;

    const yScale = (price: number) =>
      CHART_PADDING.top + chartH - ((price - minPrice) / priceRange) * chartH;

    return { xScale, yScale, minPrice, maxPrice, visibleSlots, chartW, chartH };
  }, [candles, dimensions, constants]);

  const { xScale, yScale, minPrice, maxPrice, chartW } = computeChart();

  const isUp = candles.length > 0
    ? candles[candles.length - 1].close >= candles[candles.length - 1].open
    : true;

  const priceDirection = isUp ? 'up' : 'down';
  const prevClose = candles.length >= 2 ? candles[candles.length - 2].close : constants.startingPrice;
  const priceChange = currentPrice - prevClose;
  const priceChangePct = prevClose !== 0 ? (priceChange / prevClose) * 100 : 0;

  // Grid lines
  const gridLines = [];
  const priceStep = Math.max(1, Math.ceil((maxPrice - minPrice) / 8));
  for (let p = Math.ceil(minPrice / priceStep) * priceStep; p <= maxPrice; p += priceStep) {
    gridLines.push({
      y: yScale(p),
      label: p.toFixed(0),
    });
  }

  const timeStep = 6; // every hour
  const timeLines = [];
  for (let s = 0; s <= constants.totalSlots; s += timeStep) {
    timeLines.push({
      x: xScale(s),
      label: `H${Math.floor(s / constants.slotsPerHour)}`,
    });
  }

  // Candle width based on chart width and total slots
  const candleWidth = Math.max(
    3,
    Math.min(20, (chartW ?? 500) / constants.totalSlots * 0.7)
  );

  // Sentiment color indicator
  const sentimentColor = sentiment > 0
    ? 'var(--color-buy)'
    : sentiment < 0
      ? 'var(--color-sell)'
      : 'var(--accent-primary)';

  return (
    <div className="price-chart-container" ref={containerRef}>
      {/* Current price overlay */}
      <div className={`price-current-display ${priceDirection}`}>
        <span className="font-mono">${currentPrice.toFixed(2)}</span>
        <span className="price-change-display font-mono">
          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(1)}%)
        </span>
      </div>

      {/* Sentiment indicator */}
      <div style={{ position: 'absolute', top: 12, left: 16, fontSize: '0.75rem', color: sentimentColor, fontFamily: 'var(--font-mono)' }}>
        Sentiment: {sentiment.toFixed(1)}
      </div>

      <svg className="price-chart-svg" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
        {/* Grid lines */}
        {gridLines.map((line) => (
          <line
            key={`pg-${line.label}`}
            className="chart-grid-line"
            x1={CHART_PADDING.left}
            x2={dimensions.width - CHART_PADDING.right}
            y1={line.y}
            y2={line.y}
          />
        ))}
        {gridLines.map((line) => (
          <text
            key={`pl-${line.label}`}
            className="chart-axis-label"
            x={CHART_PADDING.left - 8}
            y={line.y + 4}
            textAnchor="end"
          >
            {line.label}
          </text>
        ))}

        {/* Time lines */}
        {timeLines.map((line) => (
          <line
            key={`tg-${line.label}`}
            className="chart-grid-line"
            x1={line.x}
            x2={line.x}
            y1={CHART_PADDING.top}
            y2={dimensions.height - CHART_PADDING.bottom}
          />
        ))}
        {timeLines.map((line) => (
          <text
            key={`tl-${line.label}`}
            className="chart-axis-label"
            x={line.x}
            y={dimensions.height - CHART_PADDING.bottom + 16}
            textAnchor="middle"
          >
            {line.label}
          </text>
        ))}

        {/* Target net worth equivalent price line (approximate) */}
        {(() => {
          const targetPrice = constants.startingPrice * 2; // rough estimate
          const ty = yScale(targetPrice);
          if (ty >= CHART_PADDING.top && ty <= dimensions.height - CHART_PADDING.bottom) {
            return (
              <line
                className="target-line"
                x1={CHART_PADDING.left}
                x2={dimensions.width - CHART_PADDING.right}
                y1={ty}
                y2={ty}
              />
            );
          }
          return null;
        })()}

        {/* Candles */}
        {candles.map((candle) => {
          const isCandleUp = candle.close >= candle.open;
          const cx = xScale(candle.slot);
          const bodyTop = yScale(Math.max(candle.open, candle.close));
          const bodyBottom = yScale(Math.min(candle.open, candle.close));
          const bodyH = Math.max(1, bodyBottom - bodyTop);
          const wickTop = yScale(candle.high);
          const wickBottom = yScale(candle.low);

          const dirClass = isCandleUp ? 'up' : 'down';

          return (
            <g key={`c-${candle.slot}`}>
              {/* Wick */}
              <line
                className={`candle-wick ${dirClass}`}
                x1={cx}
                x2={cx}
                y1={wickTop}
                y2={wickBottom}
              />
              {/* Body */}
              <rect
                className={`candle-body ${dirClass}`}
                x={cx - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyH}
                rx={1}
              />
            </g>
          );
        })}

        {/* Current price indicator */}
        {candles.length > 0 && (() => {
          const lastCandle = candles[candles.length - 1];
          const cy = yScale(currentPrice);
          const cx = xScale(lastCandle.slot);
          return (
            <g>
              <line
                className="current-price-line"
                x1={CHART_PADDING.left}
                x2={dimensions.width - CHART_PADDING.right}
                y1={cy}
                y2={cy}
              />
              <circle
                className="current-price-dot"
                cx={cx}
                cy={cy}
                r={4}
              />
              <text
                className="price-label"
                x={dimensions.width - CHART_PADDING.right + 8}
                y={cy + 4}
              >
                {currentPrice.toFixed(1)}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

export default PriceChart;