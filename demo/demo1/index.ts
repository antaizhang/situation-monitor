/**
 * GDELT News Aggregator - Main Export
 */

export { NewsAggregator } from './NewsAggregator';
export { fetchCategoryNews, fetchAllNews } from './api';
export {
	ALERT_KEYWORDS,
	REGION_KEYWORDS,
	TOPIC_KEYWORDS,
	FEEDS,
	containsAlertKeyword,
	detectRegion,
	detectTopics
} from './config';
export type { NewsItem, NewsCategory, CategoryState, FeedSource } from './types';
export type { NewsEvent, NewsEventType, NewsEventHandler } from './NewsAggregator';
