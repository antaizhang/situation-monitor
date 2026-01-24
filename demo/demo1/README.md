# GDELT News Aggregator

A **framework-agnostic** news aggregation library that fetches news from GDELT across 6 categories with intelligent categorization, alert detection, and region/topic tagging.

## 🎯 Features

- **6 News Categories**: Politics, Tech, Finance, Government, AI, Intelligence
- **Alert Detection**: Automatically flags important news with keywords like "war", "nuclear", "sanctions", etc.
- **Region Detection**: Categorizes news by region (EUROPE, MENA, APAC, AMERICAS, AFRICA)
- **Topic Tagging**: Identifies topics like CYBER, NUCLEAR, CONFLICT, INTEL, DEFENSE, DIPLO
- **Framework Agnostic**: Works with React, Vue, Angular, or vanilla JavaScript
- **Event-Driven**: Subscribe to loading, loaded, and error events
- **TypeScript Support**: Fully typed with TypeScript definitions

## 📦 Installation

```bash
npm install
npm run build
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { NewsAggregator } from './NewsAggregator';

const aggregator = new NewsAggregator();

// Subscribe to events
aggregator.on('loaded', (event) => {
  console.log(`Loaded ${event.data?.length} articles for ${event.category}`);
});

// Fetch news for a category
await aggregator.fetchCategory('politics');

// Get news items
const politicsNews = aggregator.getNews('politics');
console.log(politicsNews);
```

### Fetch All Categories

```typescript
// Fetch all 6 categories at once
await aggregator.fetchAll();

// Get all news items
const allNews = aggregator.getAllNews();
```

### Get Alerts

```typescript
// Get all news items with alert keywords
const alerts = aggregator.getAlerts();

alerts.forEach(item => {
  console.log(`🚨 [${item.alertKeyword}] ${item.title}`);
});
```

### Filter by Region

```typescript
// Get news for specific region
const menaNews = aggregator.getNewsByRegion('MENA');
const europeNews = aggregator.getNewsByRegion('EUROPE');
```

### Filter by Topic

```typescript
// Get news for specific topic
const cyberNews = aggregator.getNewsByTopic('CYBER');
const nuclearNews = aggregator.getNewsByTopic('NUCLEAR');
```

## 📚 API Reference

### NewsAggregator Class

#### Methods

##### `fetchCategory(category: NewsCategory): Promise<NewsItem[]>`
Fetch news for a specific category.

**Parameters:**
- `category`: 'politics' | 'tech' | 'finance' | 'gov' | 'ai' | 'intel'

**Returns:** Promise<NewsItem[]>

##### `fetchAll(): Promise<Record<NewsCategory, NewsItem[]>>`
Fetch news for all categories.

**Returns:** Promise with all categories' news items

##### `getNews(category: NewsCategory): NewsItem[]`
Get news items for a specific category.

##### `getAllNews(): NewsItem[]`
Get all news items across all categories.

##### `getAlerts(): NewsItem[]`
Get all news items with alert keywords, sorted by timestamp.

##### `getNewsByRegion(region: string): NewsItem[]`
Filter news by region (EUROPE, MENA, APAC, AMERICAS, AFRICA).

##### `getNewsByTopic(topic: string): NewsItem[]`
Filter news by topic (CYBER, NUCLEAR, CONFLICT, INTEL, DEFENSE, DIPLO).

##### `getCategoryState(category: NewsCategory): CategoryState`
Get loading/error state for a category.

##### `on(type: NewsEventType, handler: NewsEventHandler): () => void`
Subscribe to events. Returns unsubscribe function.

**Event Types:**
- `'loading'`: Category is fetching data
- `'loaded'`: Category finished loading
- `'error'`: Category encountered an error

##### `clearCategory(category: NewsCategory): void`
Clear news items for a category.

##### `clearAll(): void`
Clear all news items.

### Types

#### NewsItem
```typescript
interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate?: string;
  timestamp: number;
  description?: string;
  source: string;
  category: NewsCategory;
  isAlert?: boolean;
  alertKeyword?: string;
  region?: string;
  topics?: string[];
}
```

#### CategoryState
```typescript
interface CategoryState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}
```

## 🔧 Configuration

### Alert Keywords
The library automatically detects news with these keywords:
- war, invasion, military, nuclear, sanctions, missile
- attack, troops, conflict, strike, bomb, casualties
- ceasefire, treaty, nato, coup, martial law
- emergency, assassination, terrorist, hostage, evacuation

### Regions
- **EUROPE**: NATO, EU, Ukraine, Russia, Germany, France, UK, etc.
- **MENA**: Iran, Israel, Saudi Arabia, Syria, Gaza, Yemen, etc.
- **APAC**: China, Taiwan, Japan, Korea, Indo-Pacific, etc.
- **AMERICAS**: US, Canada, Mexico, Brazil, Venezuela, etc.
- **AFRICA**: Sahel, Niger, Sudan, Ethiopia, Somalia, etc.

### Topics
- **CYBER**: Hacking, ransomware, malware, breaches, vulnerabilities
- **NUCLEAR**: Nuclear weapons, ICBMs, nonproliferation
- **CONFLICT**: War, military operations, combat
- **INTEL**: Intelligence, espionage, spy agencies
- **DEFENSE**: Pentagon, DoD, military branches
- **DIPLO**: Diplomacy, embassies, treaties, sanctions

## 🌐 CORS Proxy

The library uses CORS proxies to fetch data from GDELT. You can configure your own proxy in `config.ts`:

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
import { NewsAggregator } from 'gdelt-news-aggregator';

function NewsComponent() {
  const [news, setNews] = useState([]);
  const [aggregator] = useState(() => new NewsAggregator());

  useEffect(() => {
    const unsubscribe = aggregator.on('loaded', (event) => {
      if (event.category === 'politics') {
        setNews(event.data || []);
      }
    });

    aggregator.fetchCategory('politics');

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {news.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.source}</p>
        </div>
      ))}
    </div>
  );
}
```

### Vue Integration

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { NewsAggregator } from 'gdelt-news-aggregator';

const news = ref([]);
const aggregator = new NewsAggregator();

onMounted(async () => {
  aggregator.on('loaded', (event) => {
    if (event.category === 'tech') {
      news.value = event.data || [];
    }
  });

  await aggregator.fetchCategory('tech');
});
</script>

<template>
  <div v-for="item in news" :key="item.id">
    <h3>{{ item.title }}</h3>
    <p>{{ item.source }}</p>
  </div>
</template>
```

### Node.js CLI Tool

```javascript
import { NewsAggregator } from 'gdelt-news-aggregator';

const aggregator = new NewsAggregator();

await aggregator.fetchAll();
const alerts = aggregator.getAlerts();

console.log(`Found ${alerts.length} alerts:`);
alerts.forEach(item => {
  console.log(`🚨 [${item.alertKeyword}] ${item.title}`);
});
```

## 🧪 Testing

Run the included example:

```bash
npm run example
```

Or create your own test:

```bash
node example.js
```

## 📄 License

MIT

## 🔗 Data Source

This library uses the [GDELT Project](https://www.gdeltproject.org/) API for news aggregation.

## 🤝 Integration with dataAnalyse

This module is designed to be easily integrated into your **dataAnalyse** project:

1. Copy the `demo1` folder into your project
2. Import and use:
   ```typescript
   import { NewsAggregator } from './gdelt-news-aggregator';

   const aggregator = new NewsAggregator();
   await aggregator.fetchAll();
   const data = aggregator.getAllNews();
   // Use data in your analysis pipeline
   ```

The library is framework-agnostic and can work with any JavaScript/TypeScript project!
