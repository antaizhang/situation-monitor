/**
 * Federal Reserve Monitor - Main Export
 */

export { FedMonitor } from './FedMonitor';
export { fetchFedIndicators, fetchFedNews, isFredConfigured } from './api';
export { FRED_API_KEY, FRED_BASE_URL, FED_BASE_URL, FED_RSS_FEEDS } from './config';
export type {
	EconomicIndicator,
	FedIndicators,
	FedNewsItem,
	FedNewsType,
	IndicatorsState,
	NewsState
} from './types';
export type { FedEvent, FedEventType, FedEventHandler } from './FedMonitor';
