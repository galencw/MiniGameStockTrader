import type { CardConfig } from '../game/types';

/**
 * ALL_CARDS — every card in the game, grouped by type.
 *
 * Formula: priceImpactPct = faceValuePct * 0.1 * leverageMultiplier
 * For basic cards (leverage 1×), priceImpactPct = faceValuePct * 0.1
 */

// ── Basic Buy Cards (direction: 'long') ──────────────────────────────────────

const smallBuy: CardConfig = {
  id: 'small-buy',
  name: '小买入 / Small Buy',
  description: '试探性小额买入，稳扎稳打第一步。A cautious small purchase — one step at a time.',
  type: 'basic',
  direction: 'long',
  cost: 500,
  faceValuePct: 10,
  priceImpactPct: 1,
  sentimentDelta: 0,
  effects: [],
  tags: ['buy', 'basic', 'starter'],
  aiWeight: 1,
  rarity: 'common',
};

const mediumBuy: CardConfig = {
  id: 'medium-buy',
  name: '中买入 / Medium Buy',
  description: '适度加仓，跟上节奏。A measured purchase — ride the rhythm.',
  type: 'basic',
  direction: 'long',
  cost: 1000,
  faceValuePct: 20,
  priceImpactPct: 2,
  sentimentDelta: 0,
  effects: [],
  tags: ['buy', 'basic'],
  aiWeight: 1.5,
  rarity: 'common',
};

const largeBuy: CardConfig = {
  id: 'large-buy',
  name: '大买入 / Large Buy',
  description: '大手笔买入，让市场感受到你的决心！A big splash — let the market feel your resolve!',
  type: 'basic',
  direction: 'long',
  cost: 2000,
  faceValuePct: 40,
  priceImpactPct: 4,
  sentimentDelta: 1,
  effects: [],
  tags: ['buy', 'basic', 'heavy'],
  aiWeight: 2,
  rarity: 'uncommon',
};

const heavyBuy: CardConfig = {
  id: 'heavy-buy',
  name: '重仓买入 / Heavy Buy',
  description: '满仓梭哈的勇气！要么赚翻要么爆仓，人生就是一场豪赌！All-in courage — win big or blow up, life is a gamble!',
  type: 'basic',
  direction: 'long',
  cost: 3000,
  faceValuePct: 60,
  priceImpactPct: 6,
  sentimentDelta: 1,
  effects: [],
  tags: ['buy', 'basic', 'heavy', 'all-in'],
  aiWeight: 3,
  rarity: 'rare',
};

const bottomFisher: CardConfig = {
  id: 'bottom-fisher',
  name: '抄底侠 / Bottom Fisher',
  description: '别人恐惧我贪婪！低位捡漏，是散户的最高信仰。Be greedy when others are fearful — bottom fishing is retail religion.',
  type: 'basic',
  direction: 'long',
  cost: 800,
  faceValuePct: 15,
  priceImpactPct: 1.5,
  sentimentDelta: 1,
  effects: [],
  tags: ['buy', 'basic', 'conditional-low-price'],
  aiWeight: 2,
  rarity: 'uncommon',
};

// ── Basic Sell Cards (direction: 'neutral') ──────────────────────────────────
// Player sells some position, gains cash. Price impact is downward.

const smallSell: CardConfig = {
  id: 'small-sell',
  name: '小卖出 / Small Sell',
  description: '小赚落袋为安，不求暴利求安稳。Small profit in the pocket — safety over ambition.',
  type: 'basic',
  direction: 'neutral',
  cost: 0,
  faceValuePct: -10,
  priceImpactPct: -1,
  sentimentDelta: 0,
  effects: [
    { type: 'add_cash', value: 500, timing: 'immediate' },
  ],
  tags: ['sell', 'basic'],
  aiWeight: 1,
  rarity: 'common',
};

const mediumSell: CardConfig = {
  id: 'medium-sell',
  name: '中卖出 / Medium Sell',
  description: '适度减仓，保持流动性。A measured reduction — keep the cash flowing.',
  type: 'basic',
  direction: 'neutral',
  cost: 0,
  faceValuePct: -20,
  priceImpactPct: -2,
  sentimentDelta: 0,
  effects: [
    { type: 'add_cash', value: 1000, timing: 'immediate' },
  ],
  tags: ['sell', 'basic'],
  aiWeight: 1.5,
  rarity: 'common',
};

const panicSell: CardConfig = {
  id: 'panic-sell',
  name: '恐慌抛售 / Panic Sell',
  description: '天哪要崩了！赶紧跑！……跑完发现又涨了。OMG it\'s crashing! Run! …Then it goes up again.',
  type: 'basic',
  direction: 'neutral',
  cost: 0,
  faceValuePct: -30,
  priceImpactPct: -3,
  sentimentDelta: -1,
  effects: [
    { type: 'add_cash', value: 1500, timing: 'immediate' },
  ],
  tags: ['sell', 'basic', 'panic'],
  aiWeight: 1,
  rarity: 'common',
};

const strategicSell: CardConfig = {
  id: 'strategic-sell',
  name: '策略卖出 / Strategic Sell',
  description: '聪明人卖得少但拿得多。仓位小减，现金大增，这就是策略。Smart sellers let go less but gain more — small reduction, big cash boost.',
  type: 'basic',
  direction: 'neutral',
  cost: 0,
  faceValuePct: -15,
  priceImpactPct: -1.5,
  sentimentDelta: 0,
  effects: [
    { type: 'add_cash', value: 2000, timing: 'immediate' },
  ],
  tags: ['sell', 'basic', 'strategic'],
  aiWeight: 2,
  rarity: 'uncommon',
};

// ── Basic Short Cards (direction: 'short') — Opponent offensive cards ─────────

const shortAttack: CardConfig = {
  id: 'short-attack',
  name: '做空攻击 / Short Attack',
  description: '空头的常规武器——做空打压，让多头尝尝下坠的滋味。The bear\'s standard weapon — push the price down, let bulls taste the fall.',
  type: 'basic',
  direction: 'short',
  cost: 500,
  faceValuePct: -20,
  priceImpactPct: -2,
  sentimentDelta: -1,
  effects: [],
  tags: ['short', 'basic', 'opponent'],
  aiWeight: 5,
  rarity: 'common',
};

const heavyShort: CardConfig = {
  id: 'heavy-short',
  name: '重仓做空 / Heavy Short',
  description: '空头加大火力！暴跌预警，散户瑟瑟发抖。The bears dial up the firepower — crash warning, retail investors tremble.',
  type: 'basic',
  direction: 'short',
  cost: 1000,
  faceValuePct: -40,
  priceImpactPct: -4,
  sentimentDelta: -1,
  effects: [],
  tags: ['short', 'basic', 'opponent', 'heavy'],
  aiWeight: 3,
  rarity: 'uncommon',
};

const bearRaid: CardConfig = {
  id: 'bear-raid',
  name: '熊市突击 / Bear Raid',
  description: '空头的终极杀招！集中火力，一波砸盘！The bear\'s ultimate strike — concentrated firepower, a wave of selling!',
  type: 'basic',
  direction: 'short',
  cost: 2000,
  faceValuePct: -60,
  priceImpactPct: -6,
  sentimentDelta: -2,
  effects: [],
  tags: ['short', 'basic', 'opponent', 'heavy', 'ultimate'],
  aiWeight: 2,
  rarity: 'rare',
};

// ── Skill Cards ──────────────────────────────────────────────────────────────

const cashInjection: CardConfig = {
  id: 'cash-injection',
  name: '现金注入 / Cash Injection',
  description: '紧急输血！公司突然收到一笔神秘资金，谁送的？别问。Emergency transfusion — mysterious cash arrives. Don\'t ask who sent it.',
  type: 'skill',
  direction: 'neutral',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 0,
  effects: [
    { type: 'add_cash', value: 1500, timing: 'immediate' },
  ],
  tags: ['skill', 'cash'],
  aiWeight: 2,
  rarity: 'common',
};

const positionBuilder: CardConfig = {
  id: 'position-builder',
  name: '建仓术 / Position Builder',
  description: '悄悄建仓，低调进场，等大家发现时你已经坐满了。Build quietly — by the time they notice, you\'re already seated.',
  type: 'skill',
  direction: 'long',
  cost: 1000,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 0,
  effects: [
    { type: 'add_shares', value: 10, timing: 'immediate' },
  ],
  tags: ['skill', 'position'],
  aiWeight: 2,
  rarity: 'uncommon',
};

const damageControl: CardConfig = {
  id: 'damage-control',
  name: '止损术 / Damage Control',
  description: '止血急救！回撤太深就离场吧，先活下来再说。Stop the bleeding — if drawdown is too deep, survive first.',
  type: 'skill',
  direction: 'neutral',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 0,
  effects: [
    { type: 'heal_drawdown', value: 10, timing: 'immediate' },
  ],
  tags: ['skill', 'defensive'],
  aiWeight: 2,
  rarity: 'uncommon',
};

const marketResearch: CardConfig = {
  id: 'market-research',
  name: '市场调研 / Market Research',
  description: '翻翻财报、看看K线，多抽两张牌总是没错的。Flip through reports and charts — drawing two extra cards never hurts.',
  type: 'skill',
  direction: 'neutral',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 0,
  effects: [
    { type: 'draw_cards', value: 2, timing: 'immediate' },
  ],
  tags: ['skill', 'draw'],
  aiWeight: 1.5,
  rarity: 'common',
};

const insiderTip: CardConfig = {
  id: 'insider-tip',
  name: '内幕消息 / Insider Tip',
  description: '据说某大佬在饭局上说了点什么……抽三张牌，信不信由你。A big shot whispered something at dinner — draw 3 cards, believe it or not.',
  type: 'skill',
  direction: 'neutral',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 0,
  effects: [
    { type: 'draw_cards', value: 3, timing: 'immediate' },
  ],
  tags: ['skill', 'draw', 'risky'],
  aiWeight: 1,
  rarity: 'rare',
};

const leverageUp: CardConfig = {
  id: 'leverage-up',
  name: '杠杆术 / Leverage Up',
  description: '加杠杆！下一张基础卡效果翻倍。赚翻还是爆仓？看命！Leverage up — next basic card effect ×2. Fortune or ruin? Fate decides!',
  type: 'skill',
  direction: 'neutral',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 0,
  effects: [
    { type: 'leverage', value: 2, timing: 'next_card' },
  ],
  tags: ['skill', 'leverage', 'risky'],
  aiWeight: 3,
  rarity: 'uncommon',
};

const doubleDown: CardConfig = {
  id: 'double-down',
  name: '加倍术 / Double Down',
  description: '这回合所有基础卡效果×1.5！梭哈精神永流传！All basic cards ×1.5 this turn — the spirit of all-in lives forever!',
  type: 'skill',
  direction: 'neutral',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 0,
  effects: [
    { type: 'leverage', value: 1.5, timing: 'this_turn', duration: 1 },
  ],
  tags: ['skill', 'leverage', 'risky'],
  aiWeight: 2.5,
  rarity: 'uncommon',
};

const shieldWall: CardConfig = {
  id: 'shield-wall',
  name: '护盘墙 / Shield Wall',
  description: '拉起护盘大旗！下次负面价格冲击减半，多头保卫战开始！Raise the defense banner — next negative price impact halved. Bulls unite!',
  type: 'skill',
  direction: 'neutral',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 0,
  effects: [
    { type: 'price_bias', value: 2, timing: 'next_settlement' },
  ],
  tags: ['skill', 'defensive', 'shield'],
  aiWeight: 2,
  rarity: 'uncommon',
};

const sentimentBoost: CardConfig = {
  id: 'sentiment-boost',
  name: '情绪鼓舞 / Sentiment Boost',
  description: '请几位股评大V发几条利好推文，情绪马上好转！Get some influencer V\'s to tweet positivity — sentiment rebounds!',
  type: 'skill',
  direction: 'neutral',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 2,
  effects: [
    { type: 'sentiment_change', value: 2, timing: 'immediate' },
  ],
  tags: ['skill', 'sentiment'],
  aiWeight: 1.5,
  rarity: 'common',
};

// ── Event Cards ──────────────────────────────────────────────────────────────

const auntieMarket: CardConfig = {
  id: 'auntie-market',
  name: '大妈入场 / Aunties Enter Market',
  description: '菜市场大妈集体炒股！成交量暴增，弹幕全是「买买买」。Aunties from the veggie market now trade stocks! Volume explodes, danmaku floods 「buy buy buy」.',
  type: 'event',
  direction: 'long',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 2,
  effects: [
    { type: 'sentiment_change', value: 2, timing: 'immediate' },
    { type: 'price_bias', value: 2, timing: 'this_turn' },
  ],
  tags: ['event', 'humor', 'retail', 'danmaku-retail'],
  aiWeight: 2,
  rarity: 'common',
};

const goodNews: CardConfig = {
  id: 'good-news',
  name: '利好消息 / Good News',
  description: '公司发了利好公告！股价飘红，弹幕刷屏「涨停！」。Positive announcement! Price turns red, danmaku screams 「Limit up!」.',
  type: 'event',
  direction: 'long',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 1,
  effects: [
    { type: 'price_bias', value: 3, timing: 'this_turn' },
    { type: 'sentiment_change', value: 1, timing: 'immediate' },
  ],
  tags: ['event', 'positive'],
  aiWeight: 2,
  rarity: 'common',
};

const badRumor: CardConfig = {
  id: 'bad-rumor',
  name: '利空谣言 / Bad Rumor',
  description: '有人造谣！但谣言也可以是利器——短期利空，长期反转？Rumor mill! But bad rumors can be a weapon — short-term pain, long-term reversal?',
  type: 'event',
  direction: 'short',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: -1,
  effects: [
    { type: 'price_bias', value: -2, timing: 'this_turn' },
    { type: 'sentiment_change', value: -1, timing: 'immediate' },
  ],
  tags: ['event', 'negative', 'strategic'],
  aiWeight: 1.5,
  rarity: 'common',
};

const limitUp: CardConfig = {
  id: 'limit-up',
  name: '涨停板 / Limit Up',
  description: '直接涨停！+8%价格飙升，一次性的暴力利好。所有人都疯了！Direct limit up! +8% price surge — a one-time violent bull signal. Everyone goes mad!',
  type: 'event',
  direction: 'long',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 2,
  effects: [
    { type: 'price_bias', value: 8, timing: 'immediate' },
    { type: 'sentiment_change', value: 2, timing: 'immediate' },
  ],
  tags: ['event', 'positive', 'one-time'],
  aiWeight: 1,
  rarity: 'rare',
};

const marketWashout: CardConfig = {
  id: 'market-washout',
  name: '主力洗盘 / Market Maker Washout',
  description: '庄家故意砸盘洗散户！先跌再涨，熬不住的都跑了。Makers intentionally crash to wash out retail! Dip first, then rally — those who can\'t hold bail.',
  type: 'event',
  direction: 'short',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: -2,
  effects: [
    { type: 'sentiment_change', value: -2, timing: 'immediate' },
    { type: 'sentiment_change', value: 1, timing: 'next_settlement', duration: 1 },
  ],
  tags: ['event', 'negative', 'delayed-recovery', 'washout'],
  aiWeight: 1.5,
  rarity: 'uncommon',
};

const quantGoneWild: CardConfig = {
  id: 'quant-gone-wild',
  name: '量化暴走 / Quant Gone Wild',
  description: '量化机器人集体失控！波动率翻倍持续两回合，上上下下像坐过山车。Quant bots gone rogue! Volatility ×2 for 2 turns — a roller coaster ride.',
  type: 'event',
  direction: 'neutral',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 0,
  effects: [
    { type: 'volatility_change', value: 2, timing: 'this_turn', duration: 2 },
  ],
  tags: ['event', 'volatility', 'humor'],
  aiWeight: 1.5,
  rarity: 'uncommon',
};

const midnightResearch: CardConfig = {
  id: 'midnight-research',
  name: '深夜研报 / Midnight Research Report',
  description: '凌晨三点还在看研报？多抽两张牌加情绪+1，熬夜也有回报！Reading research reports at 3 AM? Draw 2 cards + sentiment +1 — insomnia pays off!',
  type: 'event',
  direction: 'long',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 1,
  effects: [
    { type: 'draw_cards', value: 2, timing: 'immediate' },
    { type: 'sentiment_change', value: 1, timing: 'immediate' },
  ],
  tags: ['event', 'research', 'draw'],
  aiWeight: 2,
  rarity: 'uncommon',
};

const retailArmy: CardConfig = {
  id: 'retail-army',
  name: '散户抱团 / Retail Army',
  description: '散户团结力量大！+5%价格推力，弹幕全是「兄弟们冲！」。Retail investors unite! +5% price push, danmaku floods 「Brothers charge!」.',
  type: 'event',
  direction: 'long',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: 1,
  effects: [
    { type: 'price_bias', value: 5, timing: 'this_turn' },
    { type: 'sentiment_change', value: 1, timing: 'immediate' },
  ],
  tags: ['event', 'retail', 'danmaku-retail'],
  aiWeight: 1.5,
  rarity: 'uncommon',
};

const flashCrash: CardConfig = {
  id: 'flash-crash',
  name: '闪崩 / Flash Crash',
  description: '突然暴跌！价格瞬间下砸5%，所有人懵了。系统故障？阴谋？A sudden plunge! Price crashes 5% instantly — system error? Conspiracy?',
  type: 'event',
  direction: 'short',
  cost: 0,
  faceValuePct: 0,
  priceImpactPct: 0,
  sentimentDelta: -2,
  effects: [
    { type: 'price_bias', value: -5, timing: 'immediate' },
    { type: 'sentiment_change', value: -2, timing: 'immediate' },
  ],
  tags: ['event', 'negative', 'crash'],
  aiWeight: 1,
  rarity: 'rare',
};

// ── Aggregate ────────────────────────────────────────────────────────────────

export const ALL_CARDS: CardConfig[] = [
  // Basic Buy
  smallBuy,
  mediumBuy,
  largeBuy,
  heavyBuy,
  bottomFisher,
  // Basic Sell
  smallSell,
  mediumSell,
  panicSell,
  strategicSell,
  // Basic Short (opponent)
  shortAttack,
  heavyShort,
  bearRaid,
  // Skill
  cashInjection,
  positionBuilder,
  damageControl,
  marketResearch,
  insiderTip,
  leverageUp,
  doubleDown,
  shieldWall,
  sentimentBoost,
  // Event
  auntieMarket,
  goodNews,
  badRumor,
  limitUp,
  marketWashout,
  quantGoneWild,
  midnightResearch,
  retailArmy,
  flashCrash,
];

/** Lookup a card config by its kebab-case id */
export const CARD_BY_ID = new Map<string, CardConfig>(
  ALL_CARDS.map((c) => [c.id, c]),
);