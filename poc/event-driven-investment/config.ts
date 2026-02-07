/**
 * 股票事件驱动投资配置
 *
 * 定义新闻模式、叙事、人物与股票板块/标签的映射关系
 */

import type { TradeSignal } from './StockEventEngine';

// ============================================================================
// 模式到板块的映射
// ============================================================================

export interface SectorMapping {
  action: TradeSignal['type'];
  sectors?: string[];
  tickers?: string[];
  instruments?: string[];
  from?: string[];
  to?: string[];
  timeHorizon?: string;
  recommendation?: string;
}

export const patternToSectorMapping: Record<string, SectorMapping> = {
  // 经济相关
  'tariffs': {
    action: 'REDUCE',
    sectors: ['XLB', 'XLI', 'XLF'],  // 材料、工业、金融
    timeHorizon: '24-48小时',
    recommendation: '关税导致成本上升，减少出口敏感板块'
  },

  'fed-rates': {
    action: 'WATCH',
    sectors: ['XLF', 'XLRE'],  // 金融、房地产
    instruments: ['TLT', 'IEF', 'SHY'],  // 债券
    timeHorizon: '1-7天',
    recommendation: '美联储利率预期调整，关注利率敏感板块'
  },

  'inflation': {
    action: 'HEDGE',
    sectors: ['XLE', 'XLB'],  // 能源、材料
    instruments: ['TIP', 'GLD', 'IAU'],  // TIPS、黄金
    timeHorizon: '1-4周',
    recommendation: '通胀压力上升，转向通胀对冲资产'
  },

  // 科技相关
  'ai-regulation': {
    action: 'WATCH',
    sectors: ['XLK', 'QQQ'],  // 科技
    tickers: ['GOOGL', 'META', 'MSFT', 'NVDA'],
    timeHorizon: '1-4周',
    recommendation: 'AI监管可能影响科技巨头业务模式'
  },

  'big-tech': {
    action: 'WATCH',
    tickers: ['GOOGL', 'META', 'AAPL', 'MSFT', 'AMZN'],
    timeHorizon: '1-7天',
    recommendation: '大型科技公司新闻，关注个股影响'
  },

  'deepfake': {
    action: 'BUY',
    tickers: ['ADBE', 'FTNT', 'PANW'],  // Adobe, Fortinet, Palo Alto
    timeHorizon: '2-8周',
    recommendation: 'Deepfake威胁增加，网络安全和内容验证需求上升'
  },

  // 地缘政治
  'china-tensions': {
    action: 'REDUCE',
    sectors: ['SMH', 'XLK'],  // 半导体、科技
    tickers: ['TSM', 'ASML', 'NVDA'],
    timeHorizon: '立即-2周',
    recommendation: '中美紧张影响半导体供应链，减少敞口'
  },

  'russia-ukraine': {
    action: 'HEDGE',
    sectors: ['XLE', 'DBA'],  // 能源、农业
    instruments: ['GLD', 'UNG'],  // 黄金、天然气
    timeHorizon: '持续监控',
    recommendation: '地缘冲突推高能源和粮食价格'
  },

  'middle-east': {
    action: 'HEDGE',
    sectors: ['XLE', 'OIH'],  // 能源、石油服务
    instruments: ['USO', 'GLD'],
    timeHorizon: '24-72小时',
    recommendation: '中东冲突风险，能源价格波动'
  },

  // 金融/加密
  'crypto': {
    action: 'WATCH',
    tickers: ['COIN', 'MSTR', 'RIOT', 'MARA'],
    instruments: ['GBTC', 'ETHE'],
    timeHorizon: '24小时-2周',
    recommendation: '加密货币监管或市场变化'
  },

  'bank-crisis': {
    action: 'SELL',
    sectors: ['XLF', 'KBE', 'KRE'],  // 金融、银行
    instruments: ['GLD', 'TLT'],  // 避险
    timeHorizon: '立即-1周',
    recommendation: '银行业危机，转向避险资产'
  },

  // 就业/经济
  'layoffs': {
    action: 'ROTATE',
    from: ['XLY', 'XLC'],  // 可选消费、通讯
    to: ['XLP', 'XLU'],    // 必需消费、公用事业
    timeHorizon: '1-4周',
    recommendation: '裁员潮预示经济放缓，转向防御板块'
  },

  'housing': {
    action: 'WATCH',
    sectors: ['XLRE', 'XHB'],  // 房地产、建筑
    timeHorizon: '2-8周',
    recommendation: '房地产市场变化'
  },

  // 供应链
  'supply-chain': {
    action: 'WATCH',
    sectors: ['XLI', 'XLB', 'XLE'],  // 工业、材料、能源
    timeHorizon: '1-4周',
    recommendation: '供应链中断影响制造业'
  }
};

// ============================================================================
// 叙事到板块的映射
// ============================================================================

export const narrativeToSectorMapping: Record<string, SectorMapping> = {
  'dollar-collapse': {
    action: 'HEDGE',
    instruments: ['GLD', 'IAU', 'UUP_puts', 'DXY_puts'],  // 黄金、美元看跌
    timeHorizon: '1-3个月',
    recommendation: '美元崩溃叙事进入主流，布局替代货币和黄金'
  },

  'ai-doom': {
    action: 'WATCH',
    sectors: ['XLK'],
    tickers: ['GOOGL', 'MSFT', 'NVDA'],
    timeHorizon: '1-6个月',
    recommendation: 'AI风险叙事可能导致监管收紧'
  },

  'energy-war': {
    action: 'OVERWEIGHT',
    sectors: ['XLE', 'OIH', 'ICLN'],  // 能源、石油、清洁能源
    timeHorizon: '2-4周',
    recommendation: '能源危机叙事扩散，加仓能源板块'
  },

  'food-crisis': {
    action: 'WATCH',
    sectors: ['DBA', 'MOO'],  // 农业
    instruments: ['CORN', 'WEAT', 'SOYB'],
    timeHorizon: '2-8周',
    recommendation: '粮食危机叙事新兴，监控农业商品'
  },

  'deep-state': {
    action: 'WATCH',
    sectors: ['XLF', 'XLE'],  // 政治叙事可能影响监管
    timeHorizon: '监控',
    recommendation: '政治叙事，关注监管变化'
  },

  'cbdc': {
    action: 'WATCH',
    tickers: ['JPM', 'BAC', 'V', 'MA', 'PYPL'],
    timeHorizon: '3-12个月',
    recommendation: 'CBDC发展可能影响支付行业'
  }
};

// ============================================================================
// 人物到股票的映射
// ============================================================================

export const characterToTickerMapping: Record<string, { tickers?: string[]; sectors?: string[]; instruments?: string[] }> = {
  'Elon Musk': {
    tickers: ['TSLA', 'DOGE'],
    sectors: ['XLK']
  },

  'Jerome Powell': {
    sectors: ['XLF', 'XLRE'],
    tickers: ['TLT', 'IEF', 'SHY']  // 债券
  },

  'Janet Yellen': {
    sectors: ['XLF'],
    tickers: ['TLT', 'IEF']
  },

  'Sam Altman': {
    tickers: ['MSFT'],  // OpenAI与微软合作
    sectors: ['XLK']
  },

  'Zuckerberg': {
    tickers: ['META']
  },

  'Bezos': {
    tickers: ['AMZN']
  },

  'Tim Cook': {
    tickers: ['AAPL']
  },

  'Sundar Pichai': {
    tickers: ['GOOGL']
  },

  'Satya Nadella': {
    tickers: ['MSFT']
  },

  'Trump': {
    sectors: ['XLE', 'XLB', 'XLI', 'XLF'],  // 能源、材料、工业、金融
    tickers: ['DJT']  // Trump Media
  },

  'Biden': {
    sectors: ['ICLN', 'TAN', 'QCLN'],  // 清洁能源
  },

  'Xi Jinping': {
    tickers: ['BABA', 'BIDU', 'JD', 'FXI'],  // 中国科技/ETF
    sectors: ['SMH']  // 半导体（负面影响）
  },

  'Putin': {
    sectors: ['XLE', 'UNG'],  // 能源、天然气
    instruments: ['GLD']  // 黄金
  },

  'Netanyahu': {
    sectors: ['XLE', 'XLF'],  // 能源、金融（地缘风险）
    instruments: ['GLD', 'USO']
  }
};

// ============================================================================
// 自定义监控器到板块的映射
// ============================================================================

export const monitorToSectorMapping: Record<string, SectorMapping> = {
  'Semiconductor Supply Crisis': {
    action: 'REDUCE',
    sectors: ['SMH', 'XLK'],
    tickers: ['NVDA', 'TSM', 'ASML', 'QCOM'],
    timeHorizon: '立即-2周',
    recommendation: '半导体供应链风险，对冲相关敞口'
  },

  'Oil/Gas Geopolitical Events': {
    action: 'HEDGE',
    sectors: ['XLE', 'OIH'],
    instruments: ['USO', 'UNG', 'GLD'],
    timeHorizon: '24-72小时',
    recommendation: '能源地缘风险，考虑做多能源或对冲'
  },

  'Tech Antitrust Actions': {
    action: 'WATCH',
    tickers: ['GOOGL', 'META', 'AAPL', 'AMZN', 'MSFT'],
    sectors: ['XLK'],
    timeHorizon: '1-4周',
    recommendation: '反垄断行动可能影响大型科技公司'
  },

  'Fed Policy Signals': {
    action: 'REPOSITION',
    sectors: ['XLF', 'XLRE'],
    instruments: ['TLT', 'IEF', 'SHY'],
    timeHorizon: '24小时-1周',
    recommendation: '调整利率敏感资产敞口'
  },

  'Taiwan Tensions': {
    action: 'REDUCE',
    sectors: ['SMH', 'XLK'],
    tickers: ['TSM', 'NVDA', 'ASML'],
    timeHorizon: '立即-2周',
    recommendation: '台海紧张，减少半导体供应链敞口'
  },

  'Crypto Regulation': {
    action: 'WATCH',
    tickers: ['COIN', 'MSTR', 'RIOT', 'MARA'],
    timeHorizon: '24小时-2周',
    recommendation: '加密货币监管变化'
  },

  'Banking Crisis': {
    action: 'SELL',
    sectors: ['XLF', 'KBE', 'KRE'],
    instruments: ['GLD', 'TLT'],
    timeHorizon: '立即-1周',
    recommendation: '银行业风险，转向避险资产'
  }
};

// ============================================================================
// 标签系统 (用于股票分类)
// ============================================================================

export interface TagMapping {
  [ticker: string]: string[];
}

export const stockTags: TagMapping = {
  // 科技
  'AAPL': ['tech', 'consumer', 'ai', 'hardware', 'china-exposure'],
  'MSFT': ['tech', 'ai', 'cloud', 'enterprise'],
  'GOOGL': ['tech', 'ai', 'advertising', 'cloud', 'antitrust-risk'],
  'META': ['tech', 'social-media', 'advertising', 'vr', 'antitrust-risk'],
  'AMZN': ['tech', 'retail', 'cloud', 'logistics'],
  'NVDA': ['tech', 'ai', 'semiconductors', 'china-exposure'],
  'TSM': ['semiconductors', 'china-exposure', 'supply-chain-risk', 'geopolitical-risk'],
  'ASML': ['semiconductors', 'china-exposure', 'supply-chain-risk'],

  // 金融
  'JPM': ['finance', 'banking', 'rates-sensitive'],
  'BAC': ['finance', 'banking', 'rates-sensitive'],
  'GS': ['finance', 'investment-banking', 'trading'],
  'MS': ['finance', 'investment-banking', 'wealth-management'],

  // 能源
  'XOM': ['energy', 'oil', 'geopolitical-sensitive'],
  'CVX': ['energy', 'oil', 'geopolitical-sensitive'],
  'SLB': ['energy', 'oilfield-services', 'geopolitical-sensitive'],

  // 防御
  'LMT': ['defense', 'aerospace', 'geopolitical-beneficiary'],
  'RTX': ['defense', 'aerospace', 'geopolitical-beneficiary'],
  'NOC': ['defense', 'aerospace', 'geopolitical-beneficiary'],

  // 加密相关
  'COIN': ['crypto', 'finance', 'regulatory-risk'],
  'MSTR': ['crypto', 'bitcoin-proxy'],
  'RIOT': ['crypto', 'mining'],
  'MARA': ['crypto', 'mining'],

  // 网络安全
  'PANW': ['cybersecurity', 'tech', 'defensive'],
  'CRWD': ['cybersecurity', 'tech', 'defensive'],
  'ZS': ['cybersecurity', 'tech', 'cloud'],
  'FTNT': ['cybersecurity', 'tech', 'defensive'],

  // 电动车/清洁能源
  'TSLA': ['ev', 'tech', 'china-exposure', 'ceo-risk', 'volatile'],
  'RIVN': ['ev', 'automotive'],
  'LCID': ['ev', 'automotive'],

  // 中国科技
  'BABA': ['china', 'tech', 'e-commerce', 'regulatory-risk', 'geopolitical-risk'],
  'BIDU': ['china', 'tech', 'ai', 'regulatory-risk'],
  'JD': ['china', 'e-commerce', 'logistics', 'regulatory-risk']
};

// ============================================================================
// 板块标签
// ============================================================================

export const sectorTags: Record<string, string[]> = {
  'XLK': ['tech', 'growth', 'rates-sensitive', 'innovation'],
  'XLF': ['finance', 'rates-sensitive', 'economic-cycle'],
  'XLE': ['energy', 'inflation-hedge', 'geopolitical-sensitive', 'commodity'],
  'XLV': ['healthcare', 'defensive', 'demographics'],
  'XLY': ['consumer-discretionary', 'economic-cycle', 'growth'],
  'XLI': ['industrial', 'economic-cycle', 'trade-sensitive'],
  'XLP': ['consumer-staples', 'defensive', 'recession-resistant'],
  'XLU': ['utilities', 'defensive', 'rates-sensitive', 'income'],
  'XLB': ['materials', 'commodity', 'economic-cycle', 'china-exposure'],
  'XLRE': ['real-estate', 'rates-sensitive', 'income'],
  'XLC': ['communications', 'tech', 'advertising'],
  'SMH': ['semiconductors', 'tech', 'supply-chain-risk', 'china-exposure', 'cyclical'],

  // 其他ETF
  'QQQ': ['tech-heavy', 'growth', 'nasdaq', 'innovation'],
  'SPY': ['diversified', 'large-cap', 'market-proxy'],
  'DIA': ['blue-chip', 'dow', 'value'],
  'IWM': ['small-cap', 'economic-cycle', 'domestic'],

  // 商品/主题
  'GLD': ['gold', 'safe-haven', 'inflation-hedge', 'anti-dollar'],
  'TLT': ['treasuries', 'safe-haven', 'rates-inverse', 'deflation-hedge'],
  'USO': ['oil', 'commodity', 'geopolitical-sensitive', 'inflation'],
  'UNG': ['natural-gas', 'commodity', 'seasonal', 'geopolitical-sensitive'],
  'DBA': ['agriculture', 'commodity', 'weather-sensitive', 'food-security'],

  // 波动率
  'VXX': ['volatility', 'hedging', 'short-term'],
  'UVXY': ['volatility', 'hedging', 'leveraged', 'short-term']
};

// ============================================================================
// 完整配置导出
// ============================================================================

export interface StockConfig {
  patternToSectorMapping: Record<string, SectorMapping>;
  narrativeToSectorMapping: Record<string, SectorMapping>;
  characterToTickerMapping: Record<string, { tickers?: string[]; sectors?: string[] }>;
  monitorToSectorMapping: Record<string, SectorMapping>;
  stockTags: TagMapping;
  sectorTags: Record<string, string[]>;
}

export const defaultStockConfig: StockConfig = {
  patternToSectorMapping,
  narrativeToSectorMapping,
  characterToTickerMapping,
  monitorToSectorMapping,
  stockTags,
  sectorTags
};
