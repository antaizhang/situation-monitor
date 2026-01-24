/**
 * Type definitions for GDELT News Aggregator
 */

/**
 * News feed category
 */
export type NewsCategory = 'politics' | 'tech' | 'finance' | 'gov' | 'ai' | 'intel';

/**
 * A news item from GDELT
 */
export interface NewsItem {
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

/**
 * Feed source configuration
 */
export interface FeedSource {
	name: string;
	url: string;
}

/**
 * Category state for tracking loading/error states
 */
export interface CategoryState {
	items: NewsItem[];
	loading: boolean;
	error: string | null;
	lastUpdated: number | null;
}
