import { useState } from 'react';

interface StartScreenProps {
  onStartGame: (seed?: number) => void;
}

function StartScreen({ onStartGame }: StartScreenProps) {
  const [seedInput, setSeedInput] = useState('');

  const handleStart = () => {
    const seed = seedInput.trim() !== '' ? parseInt(seedInput.trim(), 10) : undefined;
    if (seed !== undefined && isNaN(seed)) {
      // Invalid seed input, just start without seed
      onStartGame();
    } else {
      onStartGame(seed);
    }
  };

  return (
    <div className="start-screen">
      <div className="game-title">股市风云</div>
      <div className="game-subtitle">MiniGameStockTrader</div>

      <div className="rules-box">
        <h3>游戏规则 / Game Rules</h3>
        <ul>
          <li>8小时交易时段，48个时间格子，每格约10分钟</li>
          <li>用手牌中的买入/卖出/技能/事件卡牌操控市场</li>
          <li>每回合抽牌、出牌、结算价格变动</li>
          <li>目标：将净值从$10,000提升到$20,000</li>
          <li>空头对手随时可能出现——进入战斗模式</li>
          <li>8小时结束未达标=失败，破产=立刻出局</li>
        </ul>
      </div>

      <div>
        <div className="seed-label">种子编号（可选） / Seed (optional)</div>
        <input
          className="seed-input"
          type="text"
          placeholder="e.g. 42"
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value)}
        />
      </div>

      <button className="start-btn" onClick={handleStart}>
        开始游戏 / Start Game
      </button>
    </div>
  );
}

export default StartScreen;