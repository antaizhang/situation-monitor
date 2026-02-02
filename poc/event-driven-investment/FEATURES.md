# 事件驱动投资功能文档

## 概述

本项目（Situation Monitor）包含多个强大的功能，可用于构建**事件驱动股票投资系统**。这些功能能够：

1. 实时监控全球新闻事件
2. 自动检测关键词、地区、话题
3. 识别新闻模式和趋势
4. 追踪叙事传播（从边缘到主流）
5. 分析市场数据和板块表现
6. 自定义监控关键词和标签
7. 生成基于事件的交易信号

---

## 🎯 核心功能模块

### 1. 新闻聚合与分析

#### 1.1 GDELT新闻聚合
**功能描述**：
- 从GDELT API获取全球新闻（7天窗口）
- 支持6大类别：政治、科技、金融、政府、AI、情报
- 30+ RSS源实时更新
- 自动去重和标准化

**技术实现**：
```typescript
// 位置: /src/lib/api/news.ts
interface NewsItem {
  id: string;
  title: string;
  link: string;
  timestamp: number;
  source: string;
  category: 'politics' | 'tech' | 'finance' | 'gov' | 'ai' | 'intel';
  isAlert?: boolean;      // 是否包含警报关键词
  alertKeyword?: string;  // 触发的关键词
  region?: string;        // 地区 (EUROPE, MENA, APAC, AMERICAS, AFRICA)
  topics?: string[];      // 话题 (CYBER, NUCLEAR, CONFLICT, INTEL, DEFENSE, DIPLO)
}
```

**投资应用场景**：
```typescript
// 场景1: 科技新闻监控 → 科技股ETF (QQQ, XLK)
const techNews = await fetchCategoryNews('tech');
const aiNews = techNews.filter(n => n.topics?.includes('AI'));
if (aiNews.length >= 5) {
  // AI话题热度上升 → 考虑加仓AI相关股票
  generateSignal({
    action: 'BUY',
    sectors: ['BOTZ', 'ROBO', 'ARKQ'],
    reason: 'AI新闻激增'
  });
}

// 场景2: 金融监管新闻 → 银行股 (XLF)
const govNews = await fetchCategoryNews('gov');
const regulationNews = govNews.filter(n =>
  n.source.includes('sec') || n.title.toLowerCase().includes('regulation')
);
```

#### 1.2 关键词检测与标签系统
**功能描述**：
- **警报关键词**（27个）：战争、核武器、制裁、攻击等
- **地区分类**（5个）：欧洲、中东、亚太、美洲、非洲
- **话题标签**（6个）：网络安全、核武器、冲突、情报、国防、外交

**技术实现**：
```typescript
// 位置: /src/lib/config/keywords.ts

// 警报关键词
export const ALERT_KEYWORDS = [
  'war', 'invasion', 'military', 'nuclear', 'sanctions', 'missile',
  'attack', 'troops', 'conflict', 'strike', 'bomb', 'casualties',
  'ceasefire', 'treaty', 'nato', 'coup', 'martial law', 'emergency',
  'assassination', 'terrorist', 'hostage', 'evacuation'
];

// 地区关键词
export const REGION_KEYWORDS = {
  EUROPE: ['nato', 'eu', 'ukraine', 'russia', 'germany', 'france', 'uk'],
  MENA: ['iran', 'israel', 'saudi', 'syria', 'gaza', 'yemen', 'houthi'],
  APAC: ['china', 'taiwan', 'japan', 'korea', 'south china sea'],
  AMERICAS: ['us', 'canada', 'mexico', 'brazil', 'venezuela'],
  AFRICA: ['africa', 'sahel', 'sudan', 'ethiopia', 'somalia']
};

// 话题关键词
export const TOPIC_KEYWORDS = {
  CYBER: ['cyber', 'hack', 'ransomware', 'malware', 'breach', 'vulnerability'],
  NUCLEAR: ['nuclear', 'warhead', 'icbm', 'plutonium', 'uranium'],
  CONFLICT: ['war', 'military', 'invasion', 'strike', 'combat'],
  INTEL: ['intelligence', 'espionage', 'cia', 'mossad', 'covert'],
  DEFENSE: ['pentagon', 'dod', 'military', 'army', 'navy'],
  DIPLO: ['diplomat', 'embassy', 'sanctions', 'treaty', 'summit']
};

// 使用示例
const { isAlert, keyword } = containsAlertKeyword(newsTitle);
const region = detectRegion(newsTitle);
const topics = detectTopics(newsTitle);
```

**投资应用场景**：
```typescript
// 场景1: 地缘政治风险 → 防御性板块
const menaNews = allNews.filter(n => n.region === 'MENA' && n.isAlert);
if (menaNews.length >= 3) {
  generateSignal({
    action: 'HEDGE',
    sectors: ['XLE', 'GLD'],  // 能源 + 黄金
    reason: '中东地区冲突警报',
    confidence: 0.85
  });
}

// 场景2: 网络安全事件 → 安全软件股
const cyberNews = allNews.filter(n => n.topics?.includes('CYBER'));
if (cyberNews.length >= 5) {
  generateSignal({
    action: 'BUY',
    tickers: ['PANW', 'CRWD', 'ZS', 'FTNT'],
    reason: '网络安全事件频发',
    confidence: 0.75
  });
}

// 场景3: 亚太冲突 → 半导体供应链风险
const apacConflict = allNews.filter(n =>
  n.region === 'APAC' &&
  n.topics?.includes('CONFLICT') &&
  (n.title.includes('taiwan') || n.title.includes('china'))
);
if (apacConflict.length >= 2) {
  generateSignal({
    action: 'REDUCE',
    sectors: ['SMH'],  // 半导体ETF
    reason: '台海紧张局势 - 供应链风险',
    confidence: 0.80
  });
}
```

---

### 2. 模式分析引擎

#### 2.1 关联检测（Correlation Detection）
**功能描述**：
- 识别多个新闻源中的重复主题
- 追踪话题动量（10分钟窗口）
- 基于提及次数 + 来源多样性 + 动量的综合评分
- 生成预测信号和置信度

**技术实现**：
```typescript
// 位置: /src/lib/analysis/correlation.ts

interface CorrelationResults {
  emergingPatterns: EmergingPattern[];       // 3+提及的新兴模式
  momentumSignals: MomentumSignal[];         // 上升趋势的话题
  crossSourceCorrelations: CrossSourceCorrelation[];  // 3+来源报道
  predictiveSignals: PredictiveSignal[];     // 高置信度预测
}

interface EmergingPattern {
  id: string;           // 例如: 'tariffs', 'fed-rates'
  name: string;
  category: string;     // Economy, Tech, Geopolitics, Conflict
  count: number;        // 匹配文章数
  level: 'high' | 'elevated' | 'emerging';
  sources: string[];    // 报道的媒体
  headlines: Array<{ title: string; link: string }>;
}

interface MomentumSignal {
  id: string;
  current: number;      // 当前提及次数
  delta: number;        // 10分钟前的变化
  momentum: 'surging' | 'rising' | 'stable';
}

// 可配置的关联话题 (20+)
const CORRELATION_TOPICS = [
  {
    id: 'tariffs',
    patterns: [/tariff/i, /trade war/i, /import tax/i],
    category: 'Economy'
  },
  {
    id: 'fed-rates',
    patterns: [/federal reserve/i, /interest rate/i, /rate cut/i, /powell/i],
    category: 'Economy'
  },
  {
    id: 'china-tensions',
    patterns: [/china.*taiwan/i, /south china sea/i, /us.*china/i],
    category: 'Geopolitics'
  },
  {
    id: 'ai-regulation',
    patterns: [/ai regulation/i, /ai safety/i, /ai governance/i],
    category: 'Tech'
  },
  {
    id: 'layoffs',
    patterns: [/layoff/i, /job cut/i, /downsizing/i],
    category: 'Business'
  },
  {
    id: 'supply-chain',
    patterns: [/supply chain/i, /shipping.*delay/i, /port.*congestion/i],
    category: 'Economy'
  }
  // ... 更多话题
];

// 使用示例
const correlations = analyzeCorrelations(allNewsItems);
```

**投资应用场景**：
```typescript
// 场景1: 关税话题激增 → 材料/工业股
const tariffSignal = correlations.momentumSignals.find(s => s.id === 'tariffs');
if (tariffSignal?.momentum === 'surging' && tariffSignal.current >= 8) {
  generateSignal({
    action: 'SELL',
    sectors: ['XLB', 'XLI'],  // 材料、工业
    reason: `关税讨论激增 (提及${tariffSignal.current}次, 动量${tariffSignal.delta})`,
    confidence: 0.85,
    timeHorizon: '24-48小时'
  });
}

// 场景2: 美联储利率讨论 → 债券/金融股
const fedSignal = correlations.predictiveSignals.find(s => s.id === 'fed-rates');
if (fedSignal?.confidence >= 70) {
  generateSignal({
    action: 'REPOSITION',
    instruments: ['TLT', 'IEF', 'XLF'],
    reason: `美联储话题预测置信度${fedSignal.confidence}%`,
    prediction: fedSignal.prediction,
    timeHorizon: '1-3天'
  });
}

// 场景3: 中国紧张局势 → 科技/半导体
const chinaSignal = correlations.crossSourceCorrelations.find(s => s.id === 'china-tensions');
if (chinaSignal && chinaSignal.sourceCount >= 5) {
  generateSignal({
    action: 'HEDGE',
    sectors: ['SMH', 'QQQ'],  // 半导体、科技
    reason: `${chinaSignal.sourceCount}家媒体报道中美紧张`,
    confidence: 0.80,
    action_detail: '减少亚太供应链敞口'
  });
}

// 场景4: 裁员浪潮 → 消费/可选消费品
const layoffSignal = correlations.momentumSignals.find(s => s.id === 'layoffs');
if (layoffSignal?.delta >= 3) {
  generateSignal({
    action: 'ROTATE',
    from: ['XLY', 'XLC'],  // 可选消费、通讯
    to: ['XLP', 'XLU'],    // 必需消费、公用事业
    reason: `裁员新闻增加${layoffSignal.delta}次`,
    confidence: 0.75
  });
}
```

#### 2.2 叙事追踪（Narrative Tracking）
**功能描述**：
- 检测边缘媒体中的新兴叙事
- 追踪叙事从边缘到主流的传播
- 识别交叉点（边缘→主流）
- 标记虚假信息模式
- 追踪叙事生命周期

**技术实现**：
```typescript
// 位置: /src/lib/analysis/narrative.ts

interface NarrativeResults {
  emergingFringe: EmergingFringe[];        // 仅在边缘媒体的叙事
  fringeToMainstream: FringeToMainstream[];  // 从边缘跨越到主流
  narrativeWatch: NarrativeData[];          // 一般叙事监控
  disinfoSignals: NarrativeData[];          // 已知虚假信息
}

interface NarrativeData {
  id: string;
  name: string;
  category: string;
  severity: 'watch' | 'emerging' | 'spreading' | 'disinfo';
  count: number;
  fringeCount: number;        // 边缘媒体提及次数
  mainstreamCount: number;    // 主流媒体提及次数
  sources: string[];
  headlines: NewsItem[];
  keywords: string[];
}

interface FringeToMainstream extends NarrativeData {
  status: 'crossing';
  crossoverLevel: number;  // 主流占总数的百分比
}

// 来源分类
const SOURCE_TYPES = {
  fringe: ['zerohedge', 'gateway', 'breitbart', 'epoch'],
  alternative: ['substack', 'rumble', 'telegram'],
  mainstream: ['reuters', 'ap', 'bbc', 'cnn', 'nytimes', 'wsj', 'guardian', 'fox']
};

// 叙事模式 (15+)
const NARRATIVE_PATTERNS = [
  {
    id: 'dollar-collapse',
    keywords: ['dollar collapse', 'dedollarization', 'brics currency'],
    category: 'Finance',
    severity: 'spreading'
  },
  {
    id: 'ai-doom',
    keywords: ['ai doom', 'ai extinction', 'superintelligence risk'],
    category: 'Tech',
    severity: 'emerging'
  },
  {
    id: 'energy-war',
    keywords: ['energy crisis', 'green agenda', 'energy shortage'],
    category: 'Economy',
    severity: 'spreading'
  },
  {
    id: 'food-crisis',
    keywords: ['food shortage', 'engineered famine'],
    category: 'Economy',
    severity: 'emerging'
  }
  // ... 更多叙事
];
```

**投资应用场景**：
```typescript
// 场景1: 美元崩溃叙事跨越到主流
const dollarNarrative = narratives.fringeToMainstream.find(n => n.id === 'dollar-collapse');
if (dollarNarrative && dollarNarrative.crossoverLevel >= 0.4) {
  generateSignal({
    action: 'HEDGE',
    positions: ['GLD', 'IAU', 'DXY_puts'],  // 黄金ETF + 美元看跌期权
    reason: `美元崩溃叙事进入主流 (${Math.round(dollarNarrative.crossoverLevel * 100)}%主流报道)`,
    confidence: 0.65,
    timeHorizon: '1-3个月',
    notes: '叙事驱动，非基本面'
  });
}

// 场景2: 能源危机叙事扩散
const energyNarrative = narratives.emergingFringe.find(n => n.id === 'energy-war');
if (energyNarrative?.status === 'spreading') {
  generateSignal({
    action: 'OVERWEIGHT',
    sectors: ['XLE', 'OIH', 'ICLN'],  // 能源、石油、清洁能源
    reason: '能源危机叙事获得关注',
    coverage: `${energyNarrative.fringeCount}边缘 + ${energyNarrative.mainstreamCount}主流`,
    confidence: 0.70,
    timeHorizon: '2-4周'
  });
}

// 场景3: 粮食危机新兴（仍在边缘）
const foodNarrative = narratives.emergingFringe.find(n => n.id === 'food-crisis');
if (foodNarrative?.status === 'emerging' && foodNarrative.count >= 3) {
  generateSignal({
    action: 'WATCH',
    sectors: ['DBA', 'CORN', 'WEAT'],  // 农业商品
    reason: '粮食危机叙事在另类媒体出现',
    readiness: 0.40,
    timeHorizon: '2-8周 (监控主流传播)',
    notes: '尚未主流化，继续观察'
  });
}
```

#### 2.3 主角分析（Main Character Detection）
**功能描述**：
- 追踪新闻中最常被提及的人物/实体
- 计算提及频率和主导度
- 识别当前新闻周期的"主角"
- 用于政治风险、CEO驱动的市场波动

**技术实现**：
```typescript
// 位置: /src/lib/analysis/main-character.ts

interface MainCharacterResults {
  characters: MainCharacterEntry[];  // 前10名
  topCharacter: MainCharacterEntry | null;
}

interface MainCharacterEntry {
  name: string;
  count: number;
  rank: number;
}

// 人物模式 (20+)
const PERSON_PATTERNS = [
  { pattern: /\btrump\b/gi, name: 'Trump' },
  { pattern: /\bbiden\b/gi, name: 'Biden' },
  { pattern: /\belon\b|\bmusk\b/gi, name: 'Elon Musk' },
  { pattern: /\bpowell\b/gi, name: 'Jerome Powell' },
  { pattern: /\byellen\b/gi, name: 'Janet Yellen' },
  { pattern: /\bputin\b/gi, name: 'Putin' },
  { pattern: /\bxi\s*jinping\b/gi, name: 'Xi Jinping' },
  { pattern: /\bnetanyahu\b/gi, name: 'Netanyahu' },
  { pattern: /\baltman\b/gi, name: 'Sam Altman' },
  { pattern: /\bzuckerberg\b/gi, name: 'Zuckerberg' }
  // ... 更多
];

// 使用示例
const mainChar = calculateMainCharacter(allNewsItems);
const dominance = calculateDominance(mainChar);  // 0-100分
```

**投资应用场景**：
```typescript
// 场景1: Elon Musk主导新闻 → Tesla波动风险
const topChar = mainChar.topCharacter;
if (topChar?.name === 'Elon Musk' && topChar.count >= 15) {
  const dominance = calculateDominance(mainChar);
  generateSignal({
    action: 'MONITOR',
    tickers: ['TSLA'],
    mainCharacter: 'Elon Musk',
    mentions: topChar.count,
    dominance: dominance,
    reason: dominance > 50
      ? 'Elon主导新闻周期 - 单股高波动风险'
      : 'Elon频繁出现在头条 - 市场可能错定价TSLA',
    recommendation: 'Hedge TSLA仓位或减少敞口'
  });
}

// 场景2: Powell主导 → 利率预期
if (topChar?.name === 'Jerome Powell' && topChar.count >= 10) {
  generateSignal({
    action: 'TRADE',
    instruments: ['TLT', 'IEF', 'SHY'],  // 各期限债券
    mainCharacter: 'Jerome Powell',
    mentions: topChar.count,
    reason: 'Powell头条暗示即将有美联储沟通',
    recommendation: '为利率预期调整做准备',
    timeHorizon: '24-72小时'
  });
}

// 场景3: 新高管/CEO出现
if (topChar && topChar.rank === 1 && topChar.count >= 5) {
  // 新的突出人物可能意味着领导层变动
  generateSignal({
    action: 'INVESTIGATE',
    person: topChar.name,
    mentions: topChar.count,
    reason: '新突出人物 - 可能的领导变动',
    recommendation: '研究相关公司/板块影响'
  });
}
```

---

### 3. 市场数据集成

#### 3.1 指数、板块、商品
**功能描述**：
- 追踪4大指数：道琼斯、标普500、纳斯达克、罗素2000
- 监控12个板块ETF（科技、金融、能源、医疗等）
- 追踪6种关键商品（VIX、黄金、原油、天然气、白银、铜）
- 追踪加密货币（BTC、ETH、SOL）
- 集成Finnhub API实时定价

**技术实现**：
```typescript
// 位置: /src/lib/config/markets.ts, /src/lib/api/markets.ts

// 板块配置
const SECTORS = [
  { symbol: 'XLK', name: 'Tech' },        // 科技
  { symbol: 'XLF', name: 'Finance' },     // 金融
  { symbol: 'XLE', name: 'Energy' },      // 能源
  { symbol: 'XLV', name: 'Health' },      // 医疗
  { symbol: 'XLY', name: 'Consumer' },    // 可选消费
  { symbol: 'XLI', name: 'Industrial' },  // 工业
  { symbol: 'XLP', name: 'Staples' },     // 必需消费
  { symbol: 'XLU', name: 'Utilities' },   // 公用事业
  { symbol: 'XLB', name: 'Materials' },   // 材料
  { symbol: 'XLRE', name: 'Real Est' },   // 房地产
  { symbol: 'XLC', name: 'Comms' },       // 通讯
  { symbol: 'SMH', name: 'Semis' }        // 半导体
];

// 商品配置
const COMMODITIES = [
  { symbol: '^VIX', name: 'VIX' },         // 波动率
  { symbol: 'GC=F', name: 'Gold' },        // 黄金
  { symbol: 'CL=F', name: 'Crude Oil' },   // 原油
  { symbol: 'NG=F', name: 'Natural Gas' }, // 天然气
  { symbol: 'SI=F', name: 'Silver' },      // 白银
  { symbol: 'HG=F', name: 'Copper' }       // 铜
];

// 获取所有市场数据
const marketData = await fetchAllMarkets();
// 返回: { indices, sectors, commodities, crypto }
```

#### 3.2 市场摘要工具
**功能描述**：
- 市场趋势判断（上涨/下跌/混合）
- 最大涨幅/跌幅板块
- VIX便捷访问
- 响应式状态管理

**投资应用场景**：
```typescript
// 场景1: 关联新闻事件与市场走势
function linkNewsToMarkets(correlations: CorrelationResults, markets: MarketsState) {
  // 示例: 关税新闻高涨 + 材料/能源板块下跌 = 买入机会
  const tariffPattern = correlations.emergingPatterns.find(p => p.id === 'tariffs');
  if (tariffPattern && tariffPattern.level === 'high') {
    const materials = markets.sectors.items.find(s => s.symbol === 'XLB');
    const energy = markets.sectors.items.find(s => s.symbol === 'XLE');

    if (materials?.changePercent! < -2 && energy?.changePercent! < -2) {
      return {
        signal: 'BUY',
        rationale: '关税头条高涨，但材料/能源下跌 - 潜在超卖',
        sectors: ['XLB', 'XLE'],
        entry: '板块反弹+1-2%时入场',
        confidence: 0.75
      };
    }
  }

  // 示例: 美联储讨论 + VIX分歧
  const fedSignal = correlations.predictiveSignals.find(s => s.id === 'fed-rates');
  const vix = markets.commodities.items.find(i => i.symbol === '^VIX');

  if (fedSignal && vix && vix.changePercent > 5 && fedSignal.confidence >= 70) {
    return {
      signal: 'VOLATILITY_PLAY',
      instruments: ['VXX', 'UVXY'],  // VIX ETN
      rationale: '美联储讨论 + VIX飙升',
      setup: '利率不确定性期间波动率升高',
      timeHorizon: '24-48小时'
    };
  }
}
```

---

### 4. 自定义监控系统

#### 4.1 工作原理
**功能描述**：
- 用户创建基于关键词的自定义监控器
- 系统扫描所有新闻匹配监控器关键词
- 追踪每个监控器的匹配次数
- 支持最多20个自定义监控器
- LocalStorage持久化

**技术实现**：
```typescript
// 位置: /src/lib/stores/monitors.ts

interface CustomMonitor {
  id: string;
  name: string;
  keywords: string[];        // 监控的关键词
  enabled: boolean;
  color?: string;
  createdAt: number;
  matchCount: number;        // 匹配次数
}

interface MonitorMatch {
  monitor: CustomMonitor;
  item: NewsItem;            // 匹配的新闻
  matchedKeywords: string[]; // 哪些关键词匹配了
}

// 添加监控器
monitors.addMonitor({
  name: 'Taiwan Tensions',
  keywords: ['taiwan', 'strait', 'military exercise', 'china tension'],
  enabled: true
});

// 扫描匹配
const matches = monitors.scanForMatches(allNewsItems);
```

#### 4.2 关键词匹配
**功能描述**：
- 不区分大小写的子串匹配
- 结合标题和描述搜索
- 追踪具体触发的关键词
- 自动更新匹配计数

**投资应用场景**：
```typescript
// 创建板块/股票监控器

// 监控器1: 半导体供应危机
const semiMonitor = {
  name: 'Semiconductor Supply Crisis',
  keywords: [
    'chip shortage',
    'semiconductor supply',
    'fab disruption',
    'TSMC',
    'samsung foundry',
    'production cut'
  ],
  enabled: true
};

// 监控器2: 能源地缘政治
const energyMonitor = {
  name: 'Oil/Gas Geopolitical Events',
  keywords: [
    'middle east',
    'iran sanctions',
    'opec production cut',
    'supply disruption',
    'russia energy',
    'lng exports'
  ],
  enabled: true
};

// 监控器3: 科技反垄断
const techRegMonitor = {
  name: 'Tech Antitrust Actions',
  keywords: [
    'antitrust',
    'monopoly investigation',
    'doj tech',
    'ftc action',
    'google breakup',
    'meta regulation',
    'apple lawsuit'
  ],
  enabled: true
};

// 监控器4: 美联储货币政策
const fedMonitor = {
  name: 'Fed Policy Signals',
  keywords: [
    'powell',
    'fomc meeting',
    'interest rate',
    'rate hike',
    'rate cut',
    'quantitative easing',
    'taper'
  ],
  enabled: true
};

// 处理匹配结果
const matches = monitors.scanForMatches(allNewsItems);

for (const match of matches) {
  if (match.monitor.name === 'Semiconductor Supply Crisis') {
    if (match.item.isAlert) {
      generateSignal({
        signal: 'REDUCE',
        sectors: ['SMH', 'NVDA', 'QCOM'],
        severity: 'CRITICAL',
        reason: match.item.title,
        keywords: match.matchedKeywords,
        action: 'Hedge semiconductor exposure'
      });
    }
  }

  if (match.monitor.name === 'Fed Policy Signals') {
    generateSignal({
      signal: 'REPOSITION',
      instruments: ['TLT', 'IEF'],
      reason: match.item.title,
      keywords: match.matchedKeywords,
      action: 'Adjust duration exposure'
    });
  }
}
```

---

### 5. 服务韧性层

#### 5.1 核心功能
**功能描述**：
- **缓存管理**：带TTL的每服务缓存
- **熔断器**：防止级联故障
- **请求去重**：防止并发重复请求
- **自动重试**：指数退避重试
- **Stale-While-Revalidate**：返回陈旧数据同时后台刷新

**技术实现**：
```typescript
// 位置: /src/lib/services/client.ts

class ServiceClient {
  // 1. 缓存优先
  const cached = cache.get(cacheKey);
  if (cached && !cached.isStale) {
    return { data: cached.data, fromCache: true };
  }

  // 2. 检查熔断器
  if (!circuitBreaker.canRequest()) {
    // 熔断器打开 - 返回缓存或抛出错误
    return { data: cached.data, circuitOpen: true };
  }

  // 3. 去重并发请求
  return deduplicator.dedupe(cacheKey, () => fetchData());

  // 4. 重试逻辑
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await fetch(url);
      circuitBreaker.recordSuccess();
      cache.set(cacheKey, data, ttl);
      return data;
    } catch (error) {
      if (attempt < retries) {
        await delay(Math.pow(2, attempt) * 1000);  // 指数退避
      }
    }
  }

  circuitBreaker.recordFailure();
  throw error;
}
```

---

## 🔧 完整集成方案

### 事件驱动投资引擎
```typescript
async function eventDrivenInvestmentEngine() {
  // 1. 获取新闻并分析
  const allNews = await fetchAllNews();
  const correlations = analyzeCorrelations(allNews);
  const narratives = analyzeNarratives(allNews);
  const mainChar = calculateMainCharacter(allNews);

  // 2. 扫描自定义监控器
  const monitorMatches = monitors.scanForMatches(allNews);

  // 3. 获取市场数据
  const marketData = await fetchAllMarkets();

  // 4. 生成交易信号
  const signals = [];

  // 信号类型1: 关联 + 市场
  for (const pattern of correlations.emergingPatterns) {
    if (pattern.level === 'high') {
      const signal = mapPatternToTrade(pattern, marketData);
      if (signal) signals.push(signal);
    }
  }

  // 信号类型2: 叙事交叉
  for (const crossover of narratives.fringeToMainstream) {
    if (crossover.crossoverLevel >= 0.4) {
      const signal = mapNarrativeToTrade(crossover);
      if (signal) signals.push(signal);
    }
  }

  // 信号类型3: 主角影响
  if (mainChar.topCharacter && mainChar.topCharacter.count >= 10) {
    const signal = mapCharacterToTrade(mainChar.topCharacter);
    if (signal) signals.push(signal);
  }

  // 信号类型4: 自定义监控器警报
  for (const match of monitorMatches) {
    if (match.item.isAlert) {
      signals.push({
        type: 'MONITOR_ALERT',
        monitor: match.monitor.name,
        keywords: match.matchedKeywords,
        newsItem: match.item,
        timestamp: Date.now()
      });
    }
  }

  // 5. 执行信号
  for (const signal of signals) {
    await executeTradeSignal(signal);
  }

  return { signals, analysis: { correlations, narratives, mainChar } };
}
```

---

## 📊 数据流图

```
┌─────────────────────────────────────────────────────────────┐
│                    外部数据源                                 │
│  GDELT API | 30+ RSS Feeds | Finnhub | CoinGecko             │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    API层 (数据获取)                           │
│  news.ts | markets.ts | fred.ts                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              服务韧性层 (缓存/熔断/去重)                       │
│  ServiceClient | CacheManager | CircuitBreaker               │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
┌───────▼───────┐ ┌────▼─────┐ ┌───────▼────────┐
│  新闻富化      │ │  市场数据 │ │  自定义监控     │
│  关键词/地区/  │ │  指数/板块│ │  关键词匹配     │
│  话题检测      │ │  商品/加密│ │  警报触发       │
└───────┬───────┘ └────┬─────┘ └───────┬────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   分析引擎                                    │
│  correlation.ts | narrative.ts | main-character.ts           │
│  • 模式检测     | • 叙事追踪   | • 人物分析                  │
│  • 动量信号     | • 边缘→主流  | • 主导度计算                │
│  • 预测信号     | • 交叉检测   |                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                交易信号生成                                   │
│  • 关联模式 → 板块轮动                                        │
│  • 叙事传播 → 趋势跟随                                        │
│  • 主角分析 → 单股风险                                        │
│  • 监控警报 → 事件响应                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                执行 & 日志                                    │
│  • 交易执行 | 风险管理 | 绩效追踪                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 关键优势

### 1. **实时性**
- GDELT 7天窗口
- 10分钟动量追踪
- 市场数据实时更新

### 2. **全面性**
- 30+ 新闻源
- 12 个板块
- 6 种商品
- 20+ 关联话题
- 15+ 叙事模式

### 3. **可配置性**
- 所有关键词可定制
- 所有模式可调整
- 自定义监控器
- 灵活的信号阈值

### 4. **可靠性**
- 缓存机制
- 熔断器保护
- 自动重试
- 请求去重

### 5. **可扩展性**
- 模块化设计
- 框架无关
- TypeScript支持
- 清晰的API

---

## 📁 核心文件索引

| 功能 | 文件位置 | 关键函数 |
|------|---------|---------|
| **新闻获取** | `/src/lib/api/news.ts` | `fetchAllNews()`, `fetchCategoryNews()` |
| **关键词检测** | `/src/lib/config/keywords.ts` | `containsAlertKeyword()`, `detectRegion()`, `detectTopics()` |
| **关联分析** | `/src/lib/analysis/correlation.ts` | `analyzeCorrelations()` |
| **叙事追踪** | `/src/lib/analysis/narrative.ts` | `analyzeNarratives()` |
| **主角分析** | `/src/lib/analysis/main-character.ts` | `calculateMainCharacter()` |
| **市场数据** | `/src/lib/api/markets.ts` | `fetchAllMarkets()`, `fetchSectorPerformance()` |
| **自定义监控** | `/src/lib/stores/monitors.ts` | `addMonitor()`, `scanForMatches()` |
| **配置** | `/src/lib/config/*.ts` | 话题、叙事、人物、板块配置 |
| **服务韧性** | `/src/lib/services/client.ts` | 缓存、熔断、重试 |

---

## 🚀 快速开始

查看 `poc/event-driven-investment/` 目录中的完整POC示例，包括：

1. `StockEventEngine.ts` - 完整的事件驱动引擎实现
2. `config.ts` - 股票标签和板块映射配置
3. `example.ts` - 实际使用示例
4. `README.md` - 详细使用说明

所有功能均已集成并可直接使用！
