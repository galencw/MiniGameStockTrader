import type { EventConfig } from '../game/types';

// ── Random Events (triggered during gameplay) ────────────────────────────────
// Each has sentiment delta, price bias, volatility effect, and 2-3 danmaku lines.

const bullRunNews: EventConfig = {
  id: 'bull-run-news',
  title: '牛市来袭 / Bull Run News',
  description: '各大财经媒体头条全是「牛市确认」，散户跑步入场！',
  sentimentDelta: 2,
  priceBiasPct: 3,
  volatilityMultiplier: 1.2,
  danmakuLines: [
    { text: '牛市来了！冲冲冲！', style: 'highlight' },
    { text: '满仓干！发财了发财了！', style: 'normal' },
    { text: '这次是真的！不是假牛！', style: 'normal' },
    { text: '兄弟们跟上！别掉队！', style: 'highlight' },
    { text: '赶紧上车！再不上就来不及了！', style: 'normal' },
    { text: '我全仓了！你们呢？', style: 'normal' },
  ],
  weight: 3,
};

const bearMarketFears: EventConfig = {
  id: 'bear-market-fears',
  title: '熊市恐慌 / Bear Market Fears',
  description: '各大V齐声喊空，恐慌指数飙升，韭菜瑟瑟发抖。',
  sentimentDelta: -2,
  priceBiasPct: -2,
  volatilityMultiplier: 1.5,
  danmakuLines: [
    { text: '要崩了！赶紧跑路！', style: 'warning' },
    { text: '完了完了完了……', style: 'warning' },
    { text: '韭菜又要被割了！', style: 'normal' },
    { text: '我早说了吧！不听不听！', style: 'normal' },
    { text: '跌停了跌停了！', style: 'warning' },
    { text: '还有人敢抄底吗？', style: 'normal' },
  ],
  weight: 3,
};

const regulatoryAnnouncement: EventConfig = {
  id: 'regulatory-announcement',
  title: '监管公告 / Regulatory Announcement',
  description: '监管部门发新规，市场一脸懵，合规合规先避险。',
  sentimentDelta: -1,
  priceBiasPct: -1,
  volatilityMultiplier: 1.3,
  danmakuLines: [
    { text: '监管来了！小心小心！', style: 'warning' },
    { text: '合规合规，别乱来！', style: 'normal' },
    { text: '又要查了……先观望', style: 'normal' },
  ],
  weight: 4,
};

const bigVFail: EventConfig = {
  id: 'big-v-endorsement-fail',
  title: '大V带货翻车 / Big V Endorsement Fail',
  description: '某百万粉丝大V推荐的黑马股直接暴跌，粉丝集体维权。',
  sentimentDelta: -1,
  priceBiasPct: -1.5,
  volatilityMultiplier: 1.2,
  danmakuLines: [
    { text: '这大V靠谱吗？？？', style: 'warning' },
    { text: '又翻车了！每次都翻！', style: 'normal' },
    { text: '韭菜被割完又长出来了', style: 'normal' },
  ],
  weight: 3,
};

const fundManagerRanAway: EventConfig = {
  id: 'fund-manager-ran-away',
  title: '基金经理跑路 / Fund Manager Ran Away',
  description: '某知名基金经理突然离职，疑似跳槽去对面公司，投资者一片哗然。',
  sentimentDelta: -2,
  priceBiasPct: -2,
  volatilityMultiplier: 1.4,
  danmakuLines: [
    { text: '经理跑了！我们的钱呢！', style: 'warning' },
    { text: '信任崩塌！', style: 'warning' },
    { text: '再也不买基金了！', style: 'normal' },
  ],
  weight: 2,
};

const chatGPTPredicts: EventConfig = {
  id: 'chatgpt-predicts-market',
  title: 'ChatGPT预测股市 / ChatGPT Predicts Market',
  description: '有人用AI预测明天涨跌，结果说涨，大家信了，但准不准只有天知道。',
  sentimentDelta: 1,
  priceBiasPct: 1,
  volatilityMultiplier: 1.1,
  danmakuLines: [
    { text: 'AI说的靠谱吗？', style: 'normal' },
    { text: '这次准不准啊？', style: 'highlight' },
    { text: '量化也要看AI了？', style: 'normal' },
  ],
  weight: 3,
};

const institutionalBuying: EventConfig = {
  id: 'institutional-buying',
  title: '机构进场 / Institutional Buying',
  description: '几家大机构同步买入，量价齐升，散户大喊「跟机构走！」。',
  sentimentDelta: 2,
  priceBiasPct: 2,
  volatilityMultiplier: 0.8,
  danmakuLines: [
    { text: '大佬来了！跟机构走！', style: 'highlight' },
    { text: '主力进场了！', style: 'highlight' },
    { text: '这次有靠山了！', style: 'normal' },
  ],
  weight: 2,
};

const panicLiquidation: EventConfig = {
  id: 'panic-liquidation',
  title: '恐慌清算 / Panic Liquidation',
  description: '大规模强制平仓触发连锁反应，所有人都在跑。',
  sentimentDelta: -3,
  priceBiasPct: -3,
  volatilityMultiplier: 2,
  danmakuLines: [
    { text: '全仓清了！血亏！', style: 'warning' },
    { text: '救命救命救命！', style: 'warning' },
    { text: '保证金不够了！', style: 'warning' },
  ],
  weight: 1,
};

const governmentStimulus: EventConfig = {
  id: 'government-stimulus',
  title: '政策刺激 / Government Stimulus',
  description: '政府突然放出重磅利好政策，市场信心瞬间恢复。',
  sentimentDelta: 2,
  priceBiasPct: 3,
  volatilityMultiplier: 0.7,
  danmakuLines: [
    { text: '政策来了！大利好！', style: 'highlight' },
    { text: '国家出手了！', style: 'highlight' },
    { text: '这次是真的！', style: 'normal' },
  ],
  weight: 2,
};

const marketManipulationRumor: EventConfig = {
  id: 'market-manipulation-rumor',
  title: '操纵市场传闻 / Market Manipulation Rumor',
  description: '有人怀疑庄家在操盘，散户又慌了，但真假难辨。',
  sentimentDelta: -1,
  priceBiasPct: -1,
  volatilityMultiplier: 1.5,
  danmakuLines: [
    { text: '有人在操盘！小心！', style: 'warning' },
    { text: '庄家出没请注意！', style: 'warning' },
    { text: '小心被割！', style: 'normal' },
  ],
  weight: 3,
};

const techBreakthrough: EventConfig = {
  id: 'tech-breakthrough',
  title: '技术突破 / Tech Breakthrough',
  description: '某科技公司发布重磅新产品，概念股集体起飞。',
  sentimentDelta: 1,
  priceBiasPct: 2,
  volatilityMultiplier: 1,
  danmakuLines: [
    { text: '新技术！概念股起飞！', style: 'highlight' },
    { text: '下一个风口！', style: 'normal' },
    { text: 'AI+区块链+元宇宙！', style: 'normal' },
  ],
  weight: 3,
};

const weekendEffect: EventConfig = {
  id: 'weekend-effect',
  title: '周末效应 / Weekend Effect',
  description: '周五收盘前突然拉升，大家都想在周末前锁定利润。',
  sentimentDelta: 1,
  priceBiasPct: 1,
  volatilityMultiplier: 0.8,
  danmakuLines: [
    { text: '周五尾盘拉升！', style: 'normal' },
    { text: '周末也要看盘！', style: 'normal' },
    { text: '周一开盘必涨！（不一定）', style: 'normal' },
  ],
  weight: 2,
};

// ── Background Events (one selected at game start, sets the tone) ────────────

const bullMarketOpening: EventConfig = {
  id: 'bull-market-opening',
  title: '牛市开盘 / Bull Market Opening',
  description: '今日开盘气势如虹！大盘飘红，人气高涨，适合做多。',
  sentimentDelta: 1,
  priceBiasPct: 1,
  volatilityMultiplier: 0.8,
  danmakuLines: [
    { text: '牛市开盘！冲冲冲！', style: 'highlight' },
    { text: '今天氛围不错！', style: 'normal' },
  ],
  weight: 2,
  isBackground: true,
};

const bearMarketOpening: EventConfig = {
  id: 'bear-market-opening',
  title: '熊市开盘 / Bear Market Opening',
  description: '今日开盘一片惨淡，空头当道，散户祈祷能少亏点。',
  sentimentDelta: -1,
  priceBiasPct: -1,
  volatilityMultiplier: 1.5,
  danmakuLines: [
    { text: '熊市开盘……稳住', style: 'warning' },
    { text: '今天太难了', style: 'normal' },
  ],
  weight: 2,
  isBackground: true,
};

const volatileMarket: EventConfig = {
  id: 'volatile-market-opening',
  title: '震荡市 / Volatile Market',
  description: '市场来回震荡，涨跌不定，考验操作精度和心态。',
  sentimentDelta: 0,
  priceBiasPct: 0,
  volatilityMultiplier: 2,
  danmakuLines: [
    { text: '震荡市！上下反复！', style: 'normal' },
    { text: '考验心态的时刻', style: 'normal' },
  ],
  weight: 3,
  isBackground: true,
};

const policyDay: EventConfig = {
  id: 'policy-day-opening',
  title: '政策利好日 / Policy Day',
  description: '政策面大幅利好，市场信心高涨，波动率偏低，适合稳步做多。',
  sentimentDelta: 2,
  priceBiasPct: 1,
  volatilityMultiplier: 0.7,
  danmakuLines: [
    { text: '政策利好！今天稳！', style: 'highlight' },
    { text: '国家撑腰！放心做多！', style: 'normal' },
  ],
  weight: 1,
  isBackground: true,
};

const blackSwanWarning: EventConfig = {
  id: 'black-swan-warning',
  title: '黑天鹅预警 / Black Swan Warning',
  description: '市场弥漫不安气息，黑天鹅可能随时降临，波动率极高。',
  sentimentDelta: -1,
  priceBiasPct: -0.5,
  volatilityMultiplier: 2.5,
  danmakuLines: [
    { text: '黑天鹅预警！小心！', style: 'warning' },
    { text: '随时可能出大事', style: 'warning' },
  ],
  weight: 1,
  isBackground: true,
};

// ── Aggregate ────────────────────────────────────────────────────────────────

export const RANDOM_EVENTS: EventConfig[] = [
  bullRunNews,
  bearMarketFears,
  regulatoryAnnouncement,
  bigVFail,
  fundManagerRanAway,
  chatGPTPredicts,
  institutionalBuying,
  panicLiquidation,
  governmentStimulus,
  marketManipulationRumor,
  techBreakthrough,
  weekendEffect,
];

export const BACKGROUND_EVENTS: EventConfig[] = [
  bullMarketOpening,
  bearMarketOpening,
  volatileMarket,
  policyDay,
  blackSwanWarning,
];

/** Lookup an event by id */
export const EVENT_BY_ID = new Map<string, EventConfig>(
  [...RANDOM_EVENTS, ...BACKGROUND_EVENTS].map((e) => [e.id, e]),
);