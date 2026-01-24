# Federal Reserve Monitor

A **framework-agnostic** library for monitoring Federal Reserve economic indicators and news. Provides real-time access to FRED economic data (Fed Funds Rate, CPI, Treasury yields) and Fed RSS feeds (monetary policy, Powell speeches, testimony).

## 🎯 Features

- **Economic Indicators** (via FRED API):
  - Federal Funds Effective Rate
  - CPI Inflation (Year-over-Year)
  - 10-Year Treasury Yield
- **Fed News** (via RSS):
  - Monetary Policy Announcements
  - Chair Powell Speeches & Press Conferences
  - FOMC Testimony
  - General Fed Announcements
- **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JavaScript
- **Event-Driven**: Subscribe to loading, loaded, and error events
- **TypeScript Support**: Fully typed with TypeScript definitions

## 📦 Installation

```bash
npm install
npm run build
```

## 🔑 FRED API Key

You need a free FRED API key to fetch economic indicators:

1. Get your key at: https://fred.stlouisfed.org/docs/api/api_key.html
2. Set environment variable:
   ```bash
   export FRED_API_KEY=your_key_here
   ```

**Note**: FRED API is completely free with unlimited requests!

## 🚀 Quick Start

### Basic Usage

```typescript
import { FedMonitor } from './FedMonitor';

const monitor = new FedMonitor();

// Subscribe to events
monitor.on('indicators-loaded', (event) => {
  console.log('Indicators:', event.data);
});

// Fetch economic indicators
await monitor.fetchIndicators();
const indicators = monitor.getIndicators();

console.log(`Fed Funds Rate: ${indicators.fedFundsRate.value}%`);
console.log(`CPI Inflation: ${indicators.cpi.value}%`);
console.log(`10Y Treasury: ${indicators.treasury10Y.value}%`);
```

### Fetch Fed News

```typescript
// Fetch Fed news from RSS feeds
await monitor.fetchNews();
const news = monitor.getNews();

news.forEach(item => {
  console.log(`[${item.typeLabel}] ${item.title}`);
  console.log(item.link);
});
```

### Fetch Everything

```typescript
// Fetch both indicators and news
const { indicators, news } = await monitor.fetchAll();
```

## 📚 API Reference

### FedMonitor Class

#### Methods

##### `fetchIndicators(): Promise<FedIndicators>`
Fetch economic indicators from FRED API.

**Returns:** Promise with Fed Funds Rate, CPI, and 10Y Treasury data

##### `fetchNews(): Promise<FedNewsItem[]>`
Fetch Fed news from RSS feeds.

**Returns:** Promise with array of Fed news items

##### `fetchAll(): Promise<{ indicators: FedIndicators; news: FedNewsItem[] }>`
Fetch both indicators and news.

##### `getIndicators(): FedIndicators | null`
Get current economic indicators.

##### `getIndicatorsState(): IndicatorsState`
Get indicators state including loading/error status.

##### `getNews(): FedNewsItem[]`
Get Fed news items.

##### `getNewsState(): NewsState`
Get news state including loading/error status.

##### `getNewsByType(type: string): FedNewsItem[]`
Filter news by type ('monetary', 'powell', 'speech', 'testimony', 'announcement').

##### `getPowellNews(): FedNewsItem[]`
Get Powell-related news items.

##### `getVideoNews(): FedNewsItem[]`
Get news items with video content.

##### `on(type: FedEventType, handler: FedEventHandler): () => void`
Subscribe to events. Returns unsubscribe function.

**Event Types:**
- `'indicators-loading'`: Indicators are being fetched
- `'indicators-loaded'`: Indicators finished loading
- `'news-loading'`: News is being fetched
- `'news-loaded'`: News finished loading
- `'error'`: An error occurred

##### `isFredConfigured(): boolean`
Check if FRED API key is configured.

##### `isLoading(): boolean`
Check if any data is currently loading.

##### `clearAll(): void`
Clear all data.

### Types

#### FedIndicators
```typescript
interface FedIndicators {
  fedFundsRate: EconomicIndicator;
  cpi: EconomicIndicator;
  treasury10Y: EconomicIndicator;
}
```

#### EconomicIndicator
```typescript
interface EconomicIndicator {
  seriesId: string;
  name: string;
  value: number | null;
  previousValue: number | null;
  change: number | null;
  unit: string;
  date: string | null;
}
```

#### FedNewsItem
```typescript
interface FedNewsItem {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  timestamp: number;
  type: FedNewsType;
  typeLabel: string;
  isPowellRelated: boolean;
  hasVideo: boolean;
}
```

## 📊 Economic Indicators

### Fed Funds Rate (FEDFUNDS)
- **Frequency**: Monthly
- **Unit**: Percent (%)
- **Description**: Target federal funds rate set by the FOMC

### CPI Inflation (CPIAUCSL)
- **Frequency**: Monthly
- **Unit**: Percent (%) Year-over-Year
- **Description**: Consumer Price Index for all urban consumers

### 10-Year Treasury (DGS10)
- **Frequency**: Daily
- **Unit**: Percent (%)
- **Description**: 10-year Treasury constant maturity rate

## 📰 Fed News Sources

### RSS Feeds
- **Monetary Policy**: FOMC statements, policy decisions
- **Chair Powell**: Powell's speeches and press conferences
- **Speeches**: Fed officials' speeches
- **Testimony**: Congressional testimony
- **Announcements**: General Fed announcements

## 🌐 CORS Proxy

The library uses CORS proxies to fetch RSS feeds. You can configure your own proxy in `config.ts`:

```typescript
export const CORS_PROXIES = {
  primary: 'https://your-proxy.workers.dev/?url=',
  fallback: 'https://corsproxy.io/?url='
};
```

## 📝 Example Use Cases

### React Integration

```typescript
import { useEffect, useState } from 'react';
import { FedMonitor } from 'fed-monitor';

function FedDashboard() {
  const [indicators, setIndicators] = useState(null);
  const [monitor] = useState(() => new FedMonitor());

  useEffect(() => {
    const unsubscribe = monitor.on('indicators-loaded', (event) => {
      setIndicators(event.data);
    });

    monitor.fetchIndicators();

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {indicators && (
        <div>
          <h2>Fed Funds Rate: {indicators.fedFundsRate.value}%</h2>
          <h2>CPI: {indicators.cpi.value}%</h2>
          <h2>10Y Treasury: {indicators.treasury10Y.value}%</h2>
        </div>
      )}
    </div>
  );
}
```

### Vue Integration

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { FedMonitor } from 'fed-monitor';

const indicators = ref(null);
const news = ref([]);
const monitor = new FedMonitor();

onMounted(async () => {
  monitor.on('indicators-loaded', (event) => {
    indicators.value = event.data;
  });

  monitor.on('news-loaded', (event) => {
    news.value = event.data;
  });

  await monitor.fetchAll();
});
</script>

<template>
  <div v-if="indicators">
    <h2>Fed Funds Rate: {{ indicators.fedFundsRate.value }}%</h2>
    <h2>CPI: {{ indicators.cpi.value }}%</h2>
  </div>

  <div v-for="item in news" :key="item.id">
    <h3>{{ item.title }}</h3>
    <a :href="item.link">Read more</a>
  </div>
</template>
```

### Node.js CLI Tool

```javascript
import { FedMonitor } from 'fed-monitor';

const monitor = new FedMonitor();

const { indicators, news } = await monitor.fetchAll();

console.log('=== Economic Indicators ===');
console.log(`Fed Funds: ${indicators.fedFundsRate.value}%`);
console.log(`CPI: ${indicators.cpi.value}%`);
console.log(`10Y Treasury: ${indicators.treasury10Y.value}%`);

console.log('\n=== Recent Powell News ===');
const powellNews = monitor.getPowellNews();
powellNews.slice(0, 5).forEach(item => {
  console.log(`- ${item.title}`);
});
```

## 🧪 Testing

Run the included example:

```bash
# Set your FRED API key
export FRED_API_KEY=your_key_here

# Run example
npm run example
```

Or create your own test:

```bash
node example.js
```

## 📄 License

MIT

## 🔗 Data Sources

- **FRED API**: https://fred.stlouisfed.org/
- **Federal Reserve RSS**: https://www.federalreserve.gov/

## 🤝 Integration with dataAnalyse

This module is designed to be easily integrated into your **dataAnalyse** project:

1. Copy the `demo2` folder into your project
2. Set your FRED API key as environment variable
3. Import and use:
   ```typescript
   import { FedMonitor } from './fed-monitor';

   const monitor = new FedMonitor();
   const { indicators, news } = await monitor.fetchAll();

   // Use indicators and news in your analysis pipeline
   console.log(`Current Fed Funds Rate: ${indicators.fedFundsRate.value}%`);
   ```

The library is framework-agnostic and can work with any JavaScript/TypeScript project!

## ⚠️ Important Notes

- **FRED API Key Required**: You must get a free API key from FRED to use the economic indicators feature
- **CORS Proxy**: RSS feeds require a CORS proxy. The library includes fallback proxies, but you may want to deploy your own for production
- **Rate Limiting**: FRED API has no rate limits, but be respectful with requests
- **Data Freshness**:
  - Fed Funds Rate: Updated monthly
  - CPI: Updated monthly
  - 10Y Treasury: Updated daily (business days)
  - RSS Feeds: Real-time updates
