/**
 * 类型定义 - 从主项目导入的类型
 */

// ============================================================================
// 新闻类型
// ============================================================================

export type NewsCategory = 'politics' | 'tech' | 'finance' | 'gov' | 'ai' | 'intel';

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate?: string;
  timestamp: number;
  description?: string;
  content?: string;
  source: string;
  category: NewsCategory;
  isAlert?: boolean;
  alertKeyword?: string;
  region?: string;
  topics?: string[];
}

// ============================================================================
// 关联分析类型
// ============================================================================

export interface EmergingPattern {
  id: string;
  name: string;
  category: string;
  count: number;
  level: 'high' | 'elevated' | 'emerging';
  sources: string[];
  headlines: Array<{ title: string; link: string; source: string }>;
}

export interface MomentumSignal {
  id: string;
  name: string;
  category: string;
  current: number;
  delta: number;
  momentum: 'surging' | 'rising' | 'stable';
  headlines: Array<{ title: string; link: string; source: string }>;
}

export interface CrossSourceCorrelation {
  id: string;
  name: string;
  category: string;
  sourceCount: number;
  sources: string[];
  level: 'high' | 'elevated' | 'emerging';
  headlines: Array<{ title: string; link: string; source: string }>;
}

export interface PredictiveSignal {
  id: string;
  name: string;
  category: string;
  score: number;
  confidence: number;
  prediction: string;
  level: 'high' | 'medium' | 'low';
  headlines: Array<{ title: string; link: string; source: string }>;
}

export interface CorrelationResults {
  emergingPatterns: EmergingPattern[];
  momentumSignals: MomentumSignal[];
  crossSourceCorrelations: CrossSourceCorrelation[];
  predictiveSignals: PredictiveSignal[];
}

// ============================================================================
// 叙事分析类型
// ============================================================================

export interface NarrativeData {
  id: string;
  name: string;
  category: string;
  severity: 'watch' | 'emerging' | 'spreading' | 'disinfo';
  count: number;
  fringeCount: number;
  mainstreamCount: number;
  sources: string[];
  headlines: NewsItem[];
  keywords: string[];
}

export interface EmergingFringe extends NarrativeData {
  status: 'emerging' | 'spreading' | 'viral';
}

export interface FringeToMainstream extends NarrativeData {
  status: 'crossing';
  crossoverLevel: number;
}

export interface NarrativeResults {
  emergingFringe: EmergingFringe[];
  fringeToMainstream: FringeToMainstream[];
  narrativeWatch: NarrativeData[];
  disinfoSignals: NarrativeData[];
}

// ============================================================================
// 主角分析类型
// ============================================================================

export interface MainCharacterEntry {
  name: string;
  count: number;
  rank: number;
}

export interface MainCharacterResults {
  characters: MainCharacterEntry[];
  topCharacter: MainCharacterEntry | null;
}

// ============================================================================
// 市场数据类型
// ============================================================================

export interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface SectorPerformance {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface CryptoItem {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
}

export interface CategoryState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface MarketsState {
  indices: CategoryState<MarketItem>;
  sectors: CategoryState<SectorPerformance>;
  commodities: CategoryState<MarketItem>;
  crypto: CategoryState<CryptoItem>;
  initialized: boolean;
}

// ============================================================================
// 自定义监控类型
// ============================================================================

export interface CustomMonitor {
  id: string;
  name: string;
  keywords: string[];
  enabled: boolean;
  color?: string;
  location?: {
    name: string;
    lat: number;
    lon: number;
  };
  createdAt: number;
  updatedAt?: number;
  matchCount: number;
}

export interface MonitorMatch {
  monitor: CustomMonitor;
  item: NewsItem;
  matchedKeywords: string[];
}

// ============================================================================
// 配置类型
// ============================================================================

export interface CorrelationTopic {
  id: string;
  patterns: RegExp[];
  category: string;
}

export interface NarrativePattern {
  id: string;
  keywords: string[];
  category: string;
  severity: 'watch' | 'emerging' | 'spreading' | 'disinfo';
}

export interface PersonPattern {
  pattern: RegExp;
  name: string;
}
