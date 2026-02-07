/**
 * Type definitions for Federal Reserve Monitor
 */

/**
 * FRED Economic Indicator
 */
export interface EconomicIndicator {
	seriesId: string;
	name: string;
	value: number | null;
	previousValue: number | null;
	change: number | null;
	unit: string;
	date: string | null;
}

/**
 * Collection of Fed economic indicators
 */
export interface FedIndicators {
	fedFundsRate: EconomicIndicator;
	cpi: EconomicIndicator;
	treasury10Y: EconomicIndicator;
}

/**
 * Fed news item types
 */
export type FedNewsType = 'monetary' | 'powell' | 'speech' | 'testimony' | 'announcement';

/**
 * Fed news item from RSS feeds
 */
export interface FedNewsItem {
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

/**
 * State for economic indicators
 */
export interface IndicatorsState {
	data: FedIndicators | null;
	loading: boolean;
	error: string | null;
	lastUpdated: number | null;
}

/**
 * State for Fed news
 */
export interface NewsState {
	items: FedNewsItem[];
	loading: boolean;
	error: string | null;
	lastUpdated: number | null;
}
