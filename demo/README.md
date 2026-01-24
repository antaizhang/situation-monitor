# Situation Monitor - Independent Modules Demo

This directory contains two **framework-agnostic** JavaScript/TypeScript modules extracted from the Situation Monitor project, designed for easy integration into any project including **dataAnalyse**.

## 📦 Available Modules

### 1. GDELT News Aggregator (`demo1/`)

A news aggregation library that fetches news from GDELT across 6 categories with intelligent categorization.

**Features:**
- ✅ 6 news categories: Politics, Tech, Finance, Government, AI, Intelligence
- ✅ Automatic alert detection (war, nuclear, sanctions, etc.)
- ✅ Region detection (EUROPE, MENA, APAC, AMERICAS, AFRICA)
- ✅ Topic tagging (CYBER, NUCLEAR, CONFLICT, INTEL, DEFENSE, DIPLO)
- ✅ Framework-agnostic (React, Vue, Angular, vanilla JS)
- ✅ Event-driven architecture
- ✅ Zero dependencies (except TypeScript for development)

**Quick Start:**
```typescript
import { NewsAggregator } from './demo1/NewsAggregator';

const aggregator = new NewsAggregator();
await aggregator.fetchCategory('politics');
const news = aggregator.getNews('politics');
```

📖 [Full Documentation](./demo1/README.md)

---

### 2. Federal Reserve Monitor (`demo2/`)

A Federal Reserve monitoring library for economic indicators and Fed news.

**Features:**
- ✅ Economic indicators: Fed Funds Rate, CPI, 10Y Treasury
- ✅ Fed news: Monetary policy, Powell speeches, testimony
- ✅ FRED API integration (free, unlimited requests)
- ✅ RSS feed parsing for Fed announcements
- ✅ Framework-agnostic
- ✅ Event-driven architecture
- ✅ TypeScript support

**Quick Start:**
```typescript
import { FedMonitor } from './demo2/FedMonitor';

const monitor = new FedMonitor();
await monitor.fetchIndicators();
const indicators = monitor.getIndicators();

console.log(`Fed Funds Rate: ${indicators.fedFundsRate.value}%`);
console.log(`CPI Inflation: ${indicators.cpi.value}%`);
```

📖 [Full Documentation](./demo2/README.md)

---

## 🚀 Integration Guide

### For dataAnalyse Project

Both modules are designed to be easily integrated into your dataAnalyse project:

#### Option 1: Direct Copy
```bash
# Copy the module you need
cp -r demo/demo1 /path/to/dataAnalyse/src/modules/gdelt-news
cp -r demo/demo2 /path/to/dataAnalyse/src/modules/fed-monitor

# Install dependencies
cd /path/to/dataAnalyse/src/modules/gdelt-news
npm install

cd /path/to/dataAnalyse/src/modules/fed-monitor
npm install
```

#### Option 2: Symlink (for development)
```bash
# Create symlinks
ln -s /path/to/situation-monitor/demo/demo1 /path/to/dataAnalyse/src/modules/gdelt-news
ln -s /path/to/situation-monitor/demo/demo2 /path/to/dataAnalyse/src/modules/fed-monitor
```

#### Option 3: npm Package (recommended for production)
```bash
# In each demo folder
npm pack

# In your dataAnalyse project
npm install /path/to/gdelt-news-aggregator-1.0.0.tgz
npm install /path/to/fed-monitor-1.0.0.tgz
```

### Usage in dataAnalyse

```typescript
// Import modules
import { NewsAggregator } from './modules/gdelt-news';
import { FedMonitor } from './modules/fed-monitor';

// Create instances
const newsAggregator = new NewsAggregator();
const fedMonitor = new FedMonitor();

// Fetch data
const [allNews, fedData] = await Promise.all([
  newsAggregator.fetchAll(),
  fedMonitor.fetchAll()
]);

// Use in your analysis pipeline
console.log('News categories:', Object.keys(allNews));
console.log('Economic indicators:', fedData.indicators);
console.log('Fed news:', fedData.news);

// Filter and analyze
const alerts = newsAggregator.getAlerts();
const menaNews = newsAggregator.getNewsByRegion('MENA');
const cyberNews = newsAggregator.getNewsByTopic('CYBER');
const powellNews = fedMonitor.getPowellNews();
```

---

## 📋 Requirements

### demo1 (GDELT News Aggregator)
- **Node.js**: v18+
- **Dependencies**: None (runtime)
- **Dev Dependencies**: TypeScript, @types/node
- **External APIs**: GDELT (free, no API key required)

### demo2 (Fed Monitor)
- **Node.js**: v18+
- **Dependencies**: None (runtime)
- **Dev Dependencies**: TypeScript, @types/node
- **External APIs**:
  - FRED API (free, API key required)
  - Federal Reserve RSS (free, no API key)

---

## 🔧 Setup Instructions

### demo1: GDELT News Aggregator

```bash
cd demo/demo1

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run example
npm run example
```

### demo2: Fed Monitor

```bash
cd demo/demo2

# Install dependencies
npm install

# Get FRED API key (free)
# Visit: https://fred.stlouisfed.org/docs/api/api_key.html

# Set API key
export FRED_API_KEY=your_key_here

# Build TypeScript
npm run build

# Run example
npm run example
```

---

## 🎯 Key Differences from Original Project

These modules have been refactored to be **framework-agnostic**:

1. **Removed Svelte Dependencies**: No longer depend on Svelte stores
2. **Class-Based API**: Use classes instead of stores for state management
3. **Event-Driven**: Emit events for reactive updates (works with any framework)
4. **Zero Framework Lock-in**: Can be used with React, Vue, Angular, or vanilla JS
5. **Simplified Configuration**: All config in plain TypeScript/JavaScript files
6. **Self-Contained**: Each module is completely independent

---

## 📊 Comparison Table

| Feature | demo1 (GDELT News) | demo2 (Fed Monitor) |
|---------|-------------------|---------------------|
| **Data Source** | GDELT API | FRED API + Fed RSS |
| **API Key Required** | ❌ No | ✅ Yes (free) |
| **Categories** | 6 news categories | 3 indicators + 5 news types |
| **Real-time** | ✅ Yes (7-day window) | ✅ Yes (daily/monthly updates) |
| **CORS Proxy** | ✅ Required | ✅ Required (RSS only) |
| **Alert Detection** | ✅ Yes | ❌ No |
| **Region Detection** | ✅ Yes | ❌ No |
| **Topic Tagging** | ✅ Yes | ❌ No |
| **Framework Agnostic** | ✅ Yes | ✅ Yes |
| **TypeScript** | ✅ Yes | ✅ Yes |

---

## 📝 Example Use Cases

### News Analysis Pipeline
```typescript
// Aggregate news from all categories
const aggregator = new NewsAggregator();
await aggregator.fetchAll();

// Get all alerts
const alerts = aggregator.getAlerts();

// Analyze by region
const regions = ['EUROPE', 'MENA', 'APAC'];
const regionalNews = regions.map(region => ({
  region,
  news: aggregator.getNewsByRegion(region)
}));

// Topic clustering
const topics = ['CYBER', 'NUCLEAR', 'CONFLICT'];
const topicNews = topics.map(topic => ({
  topic,
  news: aggregator.getNewsByTopic(topic)
}));
```

### Economic Monitoring Dashboard
```typescript
// Monitor Fed indicators and news
const monitor = new FedMonitor();
const { indicators, news } = await monitor.fetchAll();

// Track rate changes
if (indicators.fedFundsRate.change !== null) {
  console.log(`Fed changed rates by ${indicators.fedFundsRate.change}%`);
}

// Monitor Powell speeches
const powellNews = monitor.getPowellNews();
const hasRecentSpeech = powellNews.some(
  n => Date.now() - n.timestamp < 7 * 24 * 60 * 60 * 1000 // 7 days
);
```

### Combined Intelligence Dashboard
```typescript
// Combine both modules
const newsAgg = new NewsAggregator();
const fedMon = new FedMonitor();

// Fetch all data
const [allNews, fedData] = await Promise.all([
  newsAgg.fetchAll(),
  fedMon.fetchAll()
]);

// Cross-reference: Financial news + Fed indicators
const financeNews = newsAgg.getNews('finance');
const fedRate = fedData.indicators.fedFundsRate.value;

// Correlation analysis
const inflationNews = financeNews.filter(n =>
  n.title.toLowerCase().includes('inflation')
);

console.log(`CPI: ${fedData.indicators.cpi.value}%`);
console.log(`Inflation mentions in news: ${inflationNews.length}`);
```

---

## 🐛 Troubleshooting

### GDELT News Aggregator

**Issue**: "CORS error"
- **Solution**: The module uses CORS proxies by default. If they fail, deploy your own Cloudflare Worker proxy.

**Issue**: "No news returned"
- **Solution**: GDELT may be temporarily unavailable. Try again in a few minutes.

### Fed Monitor

**Issue**: "FRED API key not configured"
- **Solution**: Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html and set `export FRED_API_KEY=your_key`

**Issue**: "RSS feed failed"
- **Solution**: Fed RSS feeds may be temporarily unavailable. The module will retry with fallback proxy.

---

## 📄 License

MIT

---

## 🤝 Contributing

These modules are extracted from the main Situation Monitor project. For issues or improvements:

1. Test changes in the demo folders
2. Ensure TypeScript compiles: `npm run build`
3. Verify examples work: `npm run example`
4. Document changes in README

---

## 📚 Related Documentation

- **GDELT Project**: https://www.gdeltproject.org/
- **FRED API**: https://fred.stlouisfed.org/docs/api/
- **Federal Reserve**: https://www.federalreserve.gov/

---

## ✨ Next Steps

1. **Choose the module(s)** you need for your dataAnalyse project
2. **Copy or symlink** the demo folder(s) into your project
3. **Install dependencies**: `npm install`
4. **Configure API keys** (for demo2)
5. **Import and use** in your codebase
6. **Integrate** into your analysis pipeline

Both modules are production-ready and can be used immediately! 🚀
