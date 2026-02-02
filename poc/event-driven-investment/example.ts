/**
 * 事件驱动投资引擎使用示例
 *
 * 演示如何使用StockEventEngine分析新闻并生成交易信号
 */

import { StockEventEngine } from './StockEventEngine';
import { defaultStockConfig } from './config';
import type {
  NewsItem,
  CorrelationResults,
  NarrativeResults,
  MainCharacterResults,
  MarketsState,
  MonitorMatch,
  CustomMonitor
} from './types';

// ============================================================================
// 示例数据 (实际使用时从API获取)
// ============================================================================

// 示例新闻数据
const sampleNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'US Imposes New Tariffs on Chinese Semiconductors',
    link: 'https://example.com/1',
    timestamp: Date.now(),
    source: 'Reuters',
    category: 'finance',
    isAlert: true,
    alertKeyword: 'sanctions',
    region: 'APAC',
    topics: ['CONFLICT', 'DIPLO']
  },
  {
    id: 'news-2',
    title: 'Fed Chair Powell Signals Rate Cuts May Come Sooner',
    link: 'https://example.com/2',
    timestamp: Date.now(),
    source: 'Bloomberg',
    category: 'finance',
    isAlert: false,
    region: 'AMERICAS',
    topics: ['DIPLO']
  },
  {
    id: 'news-3',
    title: 'Tariff Escalation: Trade War Intensifies',
    link: 'https://example.com/3',
    timestamp: Date.now(),
    source: 'CNBC',
    category: 'finance',
    isAlert: true,
    alertKeyword: 'war',
    region: 'AMERICAS',
    topics: ['CONFLICT']
  },
  {
    id: 'news-4',
    title: 'Major Tech Layoffs Announced Across Silicon Valley',
    link: 'https://example.com/4',
    timestamp: Date.now(),
    source: 'TechCrunch',
    category: 'tech',
    isAlert: false,
    region: 'AMERICAS',
    topics: []
  },
  {
    id: 'news-5',
    title: 'China-Taiwan Military Tensions Escalate',
    link: 'https://example.com/5',
    timestamp: Date.now(),
    source: 'BBC',
    category: 'politics',
    isAlert: true,
    alertKeyword: 'military',
    region: 'APAC',
    topics: ['CONFLICT', 'DEFENSE']
  },
  {
    id: 'news-6',
    title: 'Powell Testimony: Rate Hike Not Ruled Out',
    link: 'https://example.com/6',
    timestamp: Date.now(),
    source: 'WSJ',
    category: 'finance',
    isAlert: false,
    region: 'AMERICAS',
    topics: []
  },
  {
    id: 'news-7',
    title: 'Elon Musk Announces Major Tesla Production Changes',
    link: 'https://example.com/7',
    timestamp: Date.now(),
    source: 'Bloomberg',
    category: 'tech',
    isAlert: false,
    region: 'AMERICAS',
    topics: []
  },
  {
    id: 'news-8',
    title: 'Tariffs Could Cost US Economy Billions, Economists Warn',
    link: 'https://example.com/8',
    timestamp: Date.now(),
    source: 'Financial Times',
    category: 'finance',
    isAlert: false,
    region: 'AMERICAS',
    topics: []
  }
];

// 示例关联分析结果
const sampleCorrelations: CorrelationResults = {
  emergingPatterns: [
    {
      id: 'tariffs',
      name: 'Tariffs',
      category: 'Economy',
      count: 8,
      level: 'high',
      sources: ['Reuters', 'CNBC', 'Bloomberg', 'FT', 'WSJ'],
      headlines: [
        { title: 'US Imposes New Tariffs on Chinese Semiconductors', link: 'https://example.com/1', source: 'Reuters' },
        { title: 'Tariff Escalation: Trade War Intensifies', link: 'https://example.com/3', source: 'CNBC' }
      ]
    },
    {
      id: 'china-tensions',
      name: 'China Tensions',
      category: 'Geopolitics',
      count: 5,
      level: 'elevated',
      sources: ['BBC', 'Reuters', 'Guardian'],
      headlines: [
        { title: 'China-Taiwan Military Tensions Escalate', link: 'https://example.com/5', source: 'BBC' }
      ]
    }
  ],
  momentumSignals: [
    {
      id: 'fed-rates',
      name: 'Fed Rates',
      category: 'Economy',
      current: 6,
      delta: 4,
      momentum: 'surging',
      headlines: [
        { title: 'Fed Chair Powell Signals Rate Cuts May Come Sooner', link: 'https://example.com/2', source: 'Bloomberg' },
        { title: 'Powell Testimony: Rate Hike Not Ruled Out', link: 'https://example.com/6', source: 'WSJ' }
      ]
    }
  ],
  crossSourceCorrelations: [
    {
      id: 'tariffs',
      name: 'Tariffs',
      category: 'Economy',
      sourceCount: 5,
      sources: ['Reuters', 'CNBC', 'Bloomberg', 'FT', 'WSJ'],
      level: 'high',
      headlines: []
    }
  ],
  predictiveSignals: [
    {
      id: 'tariffs',
      name: 'Tariffs',
      category: 'Economy',
      score: 35,
      confidence: 85,
      prediction: 'Market volatility likely in next 24-48h',
      level: 'high',
      headlines: []
    }
  ]
};

// 示例叙事分析结果
const sampleNarratives: NarrativeResults = {
  emergingFringe: [],
  fringeToMainstream: [
    {
      id: 'dollar-collapse',
      name: 'Dollar Collapse',
      category: 'Finance',
      severity: 'spreading',
      count: 8,
      fringeCount: 5,
      mainstreamCount: 3,
      sources: ['ZeroHedge', 'Epoch Times', 'Reuters', 'Bloomberg'],
      headlines: [],
      keywords: ['dollar collapse', 'dedollarization', 'brics currency'],
      status: 'crossing',
      crossoverLevel: 0.375
    }
  ],
  narrativeWatch: [],
  disinfoSignals: []
};

// 示例主角分析结果
const sampleMainCharacter: MainCharacterResults = {
  characters: [
    { name: 'Jerome Powell', count: 18, rank: 1 },
    { name: 'Elon Musk', count: 12, rank: 2 },
    { name: 'Trump', count: 8, rank: 3 },
    { name: 'Biden', count: 6, rank: 4 }
  ],
  topCharacter: { name: 'Jerome Powell', count: 18, rank: 1 }
};

// 示例市场数据
const sampleMarkets: MarketsState = {
  indices: {
    items: [
      { symbol: '^GSPC', name: 'S&P 500', price: 5800, change: -45, changePercent: -0.77 },
      { symbol: '^DJI', name: 'Dow Jones', price: 42000, change: -320, changePercent: -0.76 },
      { symbol: '^IXIC', name: 'NASDAQ', price: 18500, change: -150, changePercent: -0.80 }
    ],
    loading: false,
    error: null,
    lastUpdated: Date.now()
  },
  sectors: {
    items: [
      { symbol: 'XLK', name: 'Tech', price: 200, change: -3.2, changePercent: -1.57 },
      { symbol: 'XLF', name: 'Finance', price: 40, change: -0.5, changePercent: -1.23 },
      { symbol: 'XLE', name: 'Energy', price: 85, change: 1.2, changePercent: 1.43 },
      { symbol: 'XLB', name: 'Materials', price: 82, change: -2.1, changePercent: -2.50 },
      { symbol: 'XLI', name: 'Industrial', price: 115, change: -2.5, changePercent: -2.13 },
      { symbol: 'SMH', name: 'Semis', price: 240, change: -6.8, changePercent: -2.75 }
    ],
    loading: false,
    error: null,
    lastUpdated: Date.now()
  },
  commodities: {
    items: [
      { symbol: '^VIX', name: 'VIX', price: 18.5, change: 2.3, changePercent: 14.20 },
      { symbol: 'GC=F', name: 'Gold', price: 2050, change: 15, changePercent: 0.74 },
      { symbol: 'CL=F', name: 'Oil', price: 78, change: 2, changePercent: 2.63 }
    ],
    loading: false,
    error: null,
    lastUpdated: Date.now()
  },
  crypto: {
    items: [
      { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', current_price: 65000, price_change_24h: -1200, price_change_percentage_24h: -1.81 },
      { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', current_price: 3200, price_change_24h: -80, price_change_percentage_24h: -2.44 }
    ],
    loading: false,
    error: null,
    lastUpdated: Date.now()
  },
  initialized: true
};

// 示例自定义监控器匹配
const sampleMonitorMatches: MonitorMatch[] = [
  {
    monitor: {
      id: 'monitor-1',
      name: 'Semiconductor Supply Crisis',
      keywords: ['semiconductor', 'chip shortage', 'TSMC', 'taiwan'],
      enabled: true,
      createdAt: Date.now(),
      matchCount: 2
    },
    item: sampleNews[0],
    matchedKeywords: ['semiconductor', 'taiwan']
  },
  {
    monitor: {
      id: 'monitor-2',
      name: 'Fed Policy Signals',
      keywords: ['powell', 'federal reserve', 'rate', 'interest'],
      enabled: true,
      createdAt: Date.now(),
      matchCount: 2
    },
    item: sampleNews[1],
    matchedKeywords: ['powell', 'rate']
  }
];

// ============================================================================
// 主函数 - 运行完整分析
// ============================================================================

async function runExample() {
  console.log('='.repeat(80));
  console.log('事件驱动投资引擎 - 示例');
  console.log('='.repeat(80));
  console.log();

  // 1. 创建引擎实例
  console.log('📊 初始化投资引擎...');
  const engine = new StockEventEngine(defaultStockConfig);
  console.log('✓ 引擎初始化完成');
  console.log();

  // 2. 运行分析
  console.log('🔍 分析新闻和市场数据...');
  const signals = await engine.analyze({
    news: sampleNews,
    correlations: sampleCorrelations,
    narratives: sampleNarratives,
    mainCharacter: sampleMainCharacter,
    markets: sampleMarkets,
    monitorMatches: sampleMonitorMatches
  });
  console.log(`✓ 生成 ${signals.length} 个交易信号`);
  console.log();

  // 3. 显示所有信号
  console.log('='.repeat(80));
  console.log('所有交易信号');
  console.log('='.repeat(80));
  console.log();

  signals.forEach((signal, index) => {
    console.log(`信号 #${index + 1}`);
    console.log(`${'─'.repeat(80)}`);
    console.log(`类型: ${signal.type}`);
    console.log(`来源: ${signal.source}`);
    console.log(`置信度: ${(signal.confidence * 100).toFixed(1)}%`);
    console.log(`原因: ${signal.reason}`);

    if (signal.sectors && signal.sectors.length > 0) {
      console.log(`板块: ${signal.sectors.join(', ')}`);
    }
    if (signal.tickers && signal.tickers.length > 0) {
      console.log(`股票: ${signal.tickers.join(', ')}`);
    }
    if (signal.instruments && signal.instruments.length > 0) {
      console.log(`工具: ${signal.instruments.join(', ')}`);
    }
    if (signal.timeHorizon) {
      console.log(`时间范围: ${signal.timeHorizon}`);
    }
    if (signal.recommendation) {
      console.log(`建议: ${signal.recommendation}`);
    }
    if (signal.notes) {
      console.log(`备注: ${signal.notes}`);
    }

    console.log();
  });

  // 4. 按类型分组显示
  console.log('='.repeat(80));
  console.log('按类型分组');
  console.log('='.repeat(80));
  console.log();

  const signalsByType: Record<string, number> = {};
  for (const signal of signals) {
    signalsByType[signal.type] = (signalsByType[signal.type] || 0) + 1;
  }

  for (const [type, count] of Object.entries(signalsByType)) {
    console.log(`${type}: ${count} 个信号`);
  }
  console.log();

  // 5. 高置信度信号
  console.log('='.repeat(80));
  console.log('高置信度信号 (>= 75%)');
  console.log('='.repeat(80));
  console.log();

  const highConfSignals = engine.getHighConfidenceSignals();
  console.log(`找到 ${highConfSignals.length} 个高置信度信号:`);
  console.log();

  highConfSignals.forEach((signal, index) => {
    console.log(`${index + 1}. [${signal.type}] ${signal.reason}`);
    console.log(`   置信度: ${(signal.confidence * 100).toFixed(1)}%`);
    if (signal.sectors || signal.tickers) {
      console.log(`   目标: ${(signal.sectors || signal.tickers || []).join(', ')}`);
    }
    console.log();
  });

  // 6. 按板块过滤
  console.log('='.repeat(80));
  console.log('半导体板块相关信号');
  console.log('='.repeat(80));
  console.log();

  const semiSignals = engine.getSignalsBySector('SMH');
  console.log(`找到 ${semiSignals.length} 个半导体相关信号:`);
  console.log();

  semiSignals.forEach((signal, index) => {
    console.log(`${index + 1}. [${signal.type}] ${signal.reason}`);
    console.log();
  });

  // 7. 实际交易建议总结
  console.log('='.repeat(80));
  console.log('💡 交易建议总结');
  console.log('='.repeat(80));
  console.log();

  const buySignals = signals.filter(s => s.type === 'BUY');
  const sellSignals = signals.filter(s => s.type === 'SELL' || s.type === 'REDUCE');
  const hedgeSignals = signals.filter(s => s.type === 'HEDGE');
  const watchSignals = signals.filter(s => s.type === 'WATCH' || s.type === 'MONITOR');

  if (buySignals.length > 0) {
    console.log('✅ 买入机会:');
    buySignals.forEach(s => {
      const targets = s.sectors || s.tickers || s.instruments || [];
      console.log(`   • ${targets.join(', ')} - ${s.reason.substring(0, 60)}...`);
    });
    console.log();
  }

  if (sellSignals.length > 0) {
    console.log('❌ 卖出/减仓建议:');
    sellSignals.forEach(s => {
      const targets = s.sectors || s.tickers || [];
      console.log(`   • ${targets.join(', ')} - ${s.reason.substring(0, 60)}...`);
    });
    console.log();
  }

  if (hedgeSignals.length > 0) {
    console.log('🛡️ 对冲建议:');
    hedgeSignals.forEach(s => {
      const targets = s.instruments || s.sectors || [];
      console.log(`   • ${targets.join(', ')} - ${s.reason.substring(0, 60)}...`);
    });
    console.log();
  }

  if (watchSignals.length > 0) {
    console.log('👁️ 监控列表:');
    watchSignals.slice(0, 5).forEach(s => {
      const targets = s.sectors || s.tickers || s.instruments || ['多个标的'];
      console.log(`   • ${targets.join(', ')} - ${s.reason.substring(0, 60)}...`);
    });
    if (watchSignals.length > 5) {
      console.log(`   ... 以及 ${watchSignals.length - 5} 个其他监控项`);
    }
    console.log();
  }

  // 8. 风险警示
  console.log('='.repeat(80));
  console.log('⚠️ 当前市场风险');
  console.log('='.repeat(80));
  console.log();

  const alertNews = sampleNews.filter(n => n.isAlert);
  if (alertNews.length > 0) {
    console.log(`• ${alertNews.length} 条警报级别新闻`);
    alertNews.forEach(n => {
      console.log(`  - [${n.alertKeyword}] ${n.title}`);
    });
    console.log();
  }

  const vix = sampleMarkets.commodities.items.find(i => i.symbol === '^VIX');
  if (vix && vix.changePercent > 10) {
    console.log(`• VIX飙升 ${vix.changePercent.toFixed(1)}% - 市场恐慌指数升高`);
    console.log();
  }

  const negativeSectors = sampleMarkets.sectors.items.filter(s => s.changePercent < -2);
  if (negativeSectors.length > 0) {
    console.log(`• ${negativeSectors.length} 个板块跌幅超过2%:`);
    negativeSectors.forEach(s => {
      console.log(`  - ${s.name} (${s.symbol}): ${s.changePercent.toFixed(2)}%`);
    });
    console.log();
  }

  console.log('='.repeat(80));
  console.log('分析完成！');
  console.log('='.repeat(80));
}

// 运行示例
if (require.main === module) {
  runExample().catch(console.error);
}

export { runExample };
