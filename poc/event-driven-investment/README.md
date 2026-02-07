# 事件驱动股票投资系统 POC

基于Situation Monitor功能构建的**事件驱动股票投资系统**概念验证。

## 🎯 系统概述

本POC整合了Situation Monitor的所有核心功能,用于实时监控全球新闻事件并生成基于事件的股票交易信号。

### 核心能力

1. **新闻聚合与分析**
   - GDELT API获取全球新闻（7天窗口）
   - 30+ RSS源实时更新
   - 自动关键词/地区/话题检测

2. **模式识别**
   - 关联检测（多源重复主题）
   - 动量追踪（10分钟窗口）
   - 预测信号生成

3. **叙事追踪**
   - 边缘→主流传播检测
   - 交叉点识别
   - 虚假信息标记

4. **市场分析**
   - 12个板块ETF监控
   - 6种商品追踪
   - 新闻-市场分歧检测

5. **信号生成**
   - 自动映射新闻事件到交易行动
   - 置信度评分
   - 时间范围预测

---

## 📦 文件结构

```
poc/event-driven-investment/
├── FEATURES.md               # 详细功能文档
├── README.md                 # 本文件
├── StockEventEngine.ts       # 核心引擎类
├── config.ts                 # 映射配置
├── types.ts                  # TypeScript类型定义
├── example.ts                # 使用示例
└── package.json              # 依赖配置
```

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd poc/event-driven-investment
npm install
```

### 2. 运行示例

```bash
npm run example
```

或使用TypeScript直接运行：

```bash
npx ts-node example.ts
```

### 3. 集成到项目

```typescript
import { StockEventEngine } from './StockEventEngine';
import { defaultStockConfig } from './config';

// 创建引擎实例
const engine = new StockEventEngine(defaultStockConfig);

// 运行分析
const signals = await engine.analyze({
  news: newsItems,
  correlations: correlationResults,
  narratives: narrativeResults,
  mainCharacter: mainCharResults,
  markets: marketsData,
  monitorMatches: matches
});

// 获取高置信度信号
const highConfSignals = engine.getHighConfidenceSignals();

// 按类型过滤
const buySignals = engine.getSignalsByType('BUY');
const hedgeSignals = engine.getSignalsByType('HEDGE');

// 按板块过滤
const semiSignals = engine.getSignalsBySector('SMH');
```

---

## 📊 功能详解

### 1. 关联分析 → 交易信号

**输入**: 多篇新闻中的重复主题
**输出**: 基于模式的交易信号

**示例**:
```typescript
// 关税话题激增（8篇报道，5个来源）
// → 减仓 XLB（材料）、XLI（工业）
{
  type: 'REDUCE',
  sectors: ['XLB', 'XLI'],
  reason: '关税讨论激增',
  confidence: 0.85,
  timeHorizon: '24-48小时'
}
```

### 2. 叙事传播 → 趋势信号

**输入**: 叙事从边缘媒体跨越到主流
**输出**: 基于叙事的趋势信号

**示例**:
```typescript
// "美元崩溃"叙事进入主流（37.5%主流报道）
// → 对冲美元风险：黄金、DXY看跌期权
{
  type: 'HEDGE',
  instruments: ['GLD', 'IAU', 'DXY_puts'],
  reason: '美元崩溃叙事跨越到主流',
  confidence: 0.65,
  timeHorizon: '1-3个月'
}
```

### 3. 主角分析 → 单股风险

**输入**: 特定人物主导新闻周期
**输出**: CEO/领导人驱动的风险信号

**示例**:
```typescript
// Jerome Powell被提及18次（主导度85%）
// → 监控利率敏感资产
{
  type: 'WATCH',
  sectors: ['XLF', 'XLRE'],
  tickers: ['TLT', 'IEF'],
  reason: 'Powell主导新闻周期',
  confidence: 0.80,
  timeHorizon: '24-72小时'
}
```

### 4. 自定义监控 → 即时响应

**输入**: 用户自定义关键词匹配
**输出**: 定制化交易信号

**示例**:
```typescript
// 监控器"Semiconductor Supply Crisis"触发
// 关键词: ['semiconductor', 'taiwan']
// → 减少半导体敞口
{
  type: 'REDUCE',
  sectors: ['SMH'],
  tickers: ['NVDA', 'TSM', 'ASML'],
  reason: '半导体供应链风险',
  confidence: 0.80
}
```

### 5. 市场分歧 → 反向机会

**输入**: 新闻情绪与市场走势不一致
**输出**: 基于分歧的交易机会

**示例**:
```typescript
// 关税新闻高涨（8篇），但XLB/XLI下跌>2%
// → 可能超卖，反弹机会
{
  type: 'BUY',
  sectors: ['XLB', 'XLI'],
  reason: '新闻与市场分歧 - 可能超卖',
  confidence: 0.70,
  timeHorizon: '反弹后1-2天'
}
```

---

## 🔧 配置系统

### 模式映射 (`patternToSectorMapping`)

将新闻模式映射到交易行动：

```typescript
{
  'tariffs': {
    action: 'REDUCE',
    sectors: ['XLB', 'XLI', 'XLF'],
    timeHorizon: '24-48小时',
    recommendation: '关税导致成本上升'
  },
  'fed-rates': {
    action: 'WATCH',
    sectors: ['XLF', 'XLRE'],
    instruments: ['TLT', 'IEF'],
    timeHorizon: '1-7天'
  }
}
```

### 叙事映射 (`narrativeToSectorMapping`)

将叙事传播映射到趋势交易：

```typescript
{
  'dollar-collapse': {
    action: 'HEDGE',
    instruments: ['GLD', 'IAU', 'DXY_puts'],
    timeHorizon: '1-3个月'
  }
}
```

### 人物映射 (`characterToTickerMapping`)

将关键人物映射到相关资产：

```typescript
{
  'Elon Musk': {
    tickers: ['TSLA'],
    sectors: ['XLK']
  },
  'Jerome Powell': {
    sectors: ['XLF', 'XLRE'],
    tickers: ['TLT', 'IEF', 'SHY']
  }
}
```

### 监控器映射 (`monitorToSectorMapping`)

将自定义监控器映射到交易建议：

```typescript
{
  'Semiconductor Supply Crisis': {
    action: 'REDUCE',
    sectors: ['SMH', 'XLK'],
    tickers: ['NVDA', 'TSM', 'ASML'],
    timeHorizon: '立即-2周'
  }
}
```

### 标签系统 (`stockTags`, `sectorTags`)

为股票和板块分配标签以便筛选：

```typescript
stockTags: {
  'NVDA': ['tech', 'ai', 'semiconductors', 'china-exposure'],
  'TSLA': ['ev', 'tech', 'china-exposure', 'ceo-risk', 'volatile']
}

sectorTags: {
  'XLK': ['tech', 'growth', 'rates-sensitive', 'innovation'],
  'SMH': ['semiconductors', 'tech', 'supply-chain-risk', 'china-exposure']
}
```

---

## 📈 示例输出

运行 `npm run example` 后会看到：

```
================================================================================
事件驱动投资引擎 - 示例
================================================================================

📊 初始化投资引擎...
✓ 引擎初始化完成

🔍 分析新闻和市场数据...
✓ 生成 12 个交易信号

================================================================================
所有交易信号
================================================================================

信号 #1
────────────────────────────────────────────────────────────────────────────────
类型: REDUCE
来源: CORRELATION
置信度: 85.0%
原因: Tariffs 模式 (high): 8篇报道来自5个来源
板块: XLB, XLI, XLF
时间范围: 24-48小时
建议: 关税导致成本上升，减少出口敏感板块

信号 #2
────────────────────────────────────────────────────────────────────────────────
类型: HEDGE
来源: CORRELATION
置信度: 82.0%
原因: China Tensions 模式 (elevated): 5篇报道来自3个来源
板块: SMH, XLK
股票: TSM, ASML, NVDA
时间范围: 立即-2周
建议: 中美紧张影响半导体供应链，减少敞口

...

================================================================================
💡 交易建议总结
================================================================================

✅ 买入机会:
   • XLB, XLI - 关税新闻高涨，但材料和工业板块下跌 - 可能超卖

❌ 卖出/减仓建议:
   • XLB, XLI, XLF - Tariffs 模式 (high): 8篇报道来自5个来源
   • SMH, XLK - China Tensions 模式 (elevated): 5篇报道来自3个来源

🛡️ 对冲建议:
   • GLD, IAU, DXY_puts - Dollar Collapse 叙事跨越到主流 (37.5%主流报道)
   • VXX, UVXY, SQQQ - VIX飙升14.20% + 3条警报新闻 - 市场恐慌信号

👁️ 监控列表:
   • XLF, XLRE - Fed Rates 动量激增: 当前6次提及, 增长4
   • TSLA - Elon Musk 主导新闻周期 (12次提及, 主导度50%)

================================================================================
⚠️ 当前市场风险
================================================================================

• 3 条警报级别新闻
  - [sanctions] US Imposes New Tariffs on Chinese Semiconductors
  - [war] Tariff Escalation: Trade War Intensifies
  - [military] China-Taiwan Military Tensions Escalate

• VIX飙升 14.2% - 市场恐慌指数升高

• 3 个板块跌幅超过2%:
  - Materials (XLB): -2.50%
  - Industrial (XLI): -2.13%
  - Semis (SMH): -2.75%
```

---

## 🎓 使用场景

### 场景1: 日内交易

```typescript
// 高频监控，快速响应
const engine = new StockEventEngine(defaultStockConfig);

setInterval(async () => {
  const signals = await engine.analyze(latestData);

  // 只看高置信度 + 短期信号
  const actionableSignals = signals.filter(s =>
    s.confidence >= 0.80 &&
    s.timeHorizon?.includes('24') || s.timeHorizon?.includes('小时')
  );

  // 执行交易
  for (const signal of actionableSignals) {
    await executeTrade(signal);
  }
}, 5 * 60 * 1000);  // 每5分钟
```

### 场景2: 趋势跟随

```typescript
// 中长期，叙事驱动
const signals = await engine.analyze(data);

// 关注叙事传播和预测信号
const narrativeSignals = signals.filter(s =>
  s.source === 'NARRATIVE' &&
  s.confidence >= 0.65
);

// 逐步建仓
for (const signal of narrativeSignals) {
  if (signal.type === 'OVERWEIGHT') {
    incrementallyBuy(signal.sectors, signal.timeHorizon);
  }
}
```

### 场景3: 风险管理

```typescript
// 对冲和防御
const signals = await engine.analyze(data);

// 优先处理对冲信号
const hedgeSignals = signals.filter(s =>
  s.type === 'HEDGE' && s.confidence >= 0.75
);

// 检查VIX
const vix = data.markets.commodities.items.find(i => i.symbol === '^VIX');
if (vix && vix.changePercent > 10) {
  // 立即对冲
  for (const signal of hedgeSignals) {
    await hedgePortfolio(signal.instruments);
  }
}
```

### 场景4: 板块轮动

```typescript
// 基于关联模式轮动
const signals = await engine.analyze(data);

const rotateSignals = signals.filter(s => s.type === 'ROTATE');

for (const signal of rotateSignals) {
  // 从弱势板块轮动到强势板块
  await rotateSectors(signal.from, signal.to);
}
```

---

## 🔗 与dataAnalyse项目集成

### 1. 复制POC到项目

```bash
cp -r poc/event-driven-investment /path/to/dataAnalyse/src/modules/
```

### 2. 在dataAnalyse中使用

```typescript
import { StockEventEngine } from './modules/event-driven-investment/StockEventEngine';
import { defaultStockConfig } from './modules/event-driven-investment/config';

// 在数据分析流程中集成
class DataAnalysisSystem {
  private eventEngine: StockEventEngine;

  constructor() {
    this.eventEngine = new StockEventEngine(defaultStockConfig);
  }

  async analyzeMarket(data: MarketData) {
    // 1. 获取原始数据
    const news = await this.fetchNews();
    const markets = await this.fetchMarkets();

    // 2. 运行事件驱动分析
    const signals = await this.eventEngine.analyze({
      news,
      correlations: this.analyzeCorrelations(news),
      narratives: this.analyzeNarratives(news),
      mainCharacter: this.analyzeMainCharacter(news),
      markets,
      monitorMatches: this.scanMonitors(news)
    });

    // 3. 结合其他分析模块
    const technicalSignals = this.technicalAnalysis(data);
    const fundamentalSignals = this.fundamentalAnalysis(data);

    // 4. 综合决策
    return this.combineSignals(signals, technicalSignals, fundamentalSignals);
  }
}
```

### 3. 自定义配置

```typescript
import { defaultStockConfig } from './config';
import type { StockConfig } from './config';

// 创建自定义配置
const myConfig: StockConfig = {
  ...defaultStockConfig,

  // 添加自定义模式映射
  patternToSectorMapping: {
    ...defaultStockConfig.patternToSectorMapping,
    'my-custom-pattern': {
      action: 'BUY',
      tickers: ['CUSTOM1', 'CUSTOM2'],
      timeHorizon: '1周',
      recommendation: '自定义建议'
    }
  },

  // 添加自定义股票标签
  stockTags: {
    ...defaultStockConfig.stockTags,
    'CUSTOM_TICKER': ['tag1', 'tag2', 'tag3']
  }
};

const engine = new StockEventEngine(myConfig);
```

---

## 📚 完整文档

- **[FEATURES.md](./FEATURES.md)** - 详细功能说明和技术实现
- **[StockEventEngine.ts](./StockEventEngine.ts)** - 核心引擎代码
- **[config.ts](./config.ts)** - 完整配置示例
- **[example.ts](./example.ts)** - 使用示例代码

---

## 💡 最佳实践

### 1. 置信度阈值

```typescript
// 保守策略：只执行高置信度信号
const conservativeSignals = signals.filter(s => s.confidence >= 0.80);

// 激进策略：包含中等置信度
const aggressiveSignals = signals.filter(s => s.confidence >= 0.60);
```

### 2. 时间范围优先级

```typescript
// 短期交易：优先处理24-48小时信号
const shortTerm = signals.filter(s =>
  s.timeHorizon?.includes('24') || s.timeHorizon?.includes('48')
);

// 长期投资：关注1周以上信号
const longTerm = signals.filter(s =>
  s.timeHorizon?.includes('周') || s.timeHorizon?.includes('个月')
);
```

### 3. 信号确认

```typescript
// 需要多个来源确认
const confirmedSignals = signals.filter(s => {
  const triggerCount = (
    (s.triggerData.newsItems?.length || 0) +
    (s.triggerData.patterns?.length || 0) * 2
  );
  return triggerCount >= 3;
});
```

### 4. 风险控制

```typescript
// 检查警报新闻数量
const alertCount = data.news.filter(n => n.isAlert).length;
if (alertCount >= 3) {
  // 风险升高，减少敞口
  const reduceSignals = signals.filter(s =>
    s.type === 'REDUCE' || s.type === 'HEDGE'
  );
  // 优先执行
}
```

---

## ⚠️ 免责声明

**本POC仅供教育和研究目的。**

- 不构成投资建议
- 示例数据为模拟数据
- 实际使用需自行承担风险
- 建议结合其他分析方法
- 务必进行充分回测

---

## 🤝 贡献

欢迎改进和扩展：

- 添加更多模式映射
- 优化置信度计算
- 增强风险控制
- 集成更多数据源

---

## 📄 许可

MIT License
