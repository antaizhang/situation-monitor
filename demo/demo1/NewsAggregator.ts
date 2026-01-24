/**
 * GDELT News Aggregator - Framework-agnostic news aggregation class
 */

import type { NewsItem, NewsCategory, CategoryState } from './types';
import { fetchCategoryNews, fetchAllNews } from './api';
import { containsAlertKeyword, detectRegion, detectTopics } from './config';

export type NewsEventType = 'loading' | 'loaded' | 'error';

export interface NewsEvent {
	type: NewsEventType;
	category: NewsCategory;
	data?: NewsItem[];
	error?: string;
}

export type NewsEventHandler = (event: NewsEvent) => void;

/**
 * GDELT News Aggregator Class
 *
 * A framework-agnostic class for fetching and managing news from GDELT.
 * Can be used in React, Vue, Angular, or vanilla JavaScript.
 *
 * @example
 * ```typescript
 * const aggregator = new NewsAggregator();
 *
 * // Subscribe to events
 * aggregator.on('loading', (event) => {
 *   console.log(`Loading ${event.category}...`);
 * });
 *
 * aggregator.on('loaded', (event) => {
 *   console.log(`Loaded ${event.data?.length} articles for ${event.category}`);
 * });
 *
 * // Fetch news
 * await aggregator.fetchCategory('politics');
 *
 * // Get news
 * const politicsNews = aggregator.getNews('politics');
 * ```
 */
export class NewsAggregator {
	private categories: Record<NewsCategory, CategoryState>;
	private eventHandlers: Map<NewsEventType, Set<NewsEventHandler>>;

	constructor() {
		this.categories = this.createInitialState();
		this.eventHandlers = new Map();
	}

	/**
	 * Create initial state for all categories
	 */
	private createInitialState(): Record<NewsCategory, CategoryState> {
		const cats: NewsCategory[] = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'];
		const state: Partial<Record<NewsCategory, CategoryState>> = {};

		for (const cat of cats) {
			state[cat] = {
				items: [],
				loading: false,
				error: null,
				lastUpdated: null
			};
		}

		return state as Record<NewsCategory, CategoryState>;
	}

	/**
	 * Enrich news item with analysis
	 */
	private enrichNewsItem(item: NewsItem): NewsItem {
		const text = `${item.title} ${item.description || ''}`;
		const alertResult = containsAlertKeyword(text);

		return {
			...item,
			isAlert: alertResult.isAlert,
			alertKeyword: alertResult.keyword,
			region: item.region ?? detectRegion(text) ?? undefined,
			topics: item.topics ?? detectTopics(text)
		};
	}

	/**
	 * Emit an event to all registered handlers
	 */
	private emit(event: NewsEvent): void {
		const handlers = this.eventHandlers.get(event.type);
		if (handlers) {
			handlers.forEach((handler) => handler(event));
		}
	}

	/**
	 * Subscribe to events
	 */
	on(type: NewsEventType, handler: NewsEventHandler): () => void {
		if (!this.eventHandlers.has(type)) {
			this.eventHandlers.set(type, new Set());
		}
		this.eventHandlers.get(type)!.add(handler);

		// Return unsubscribe function
		return () => {
			this.eventHandlers.get(type)?.delete(handler);
		};
	}

	/**
	 * Fetch news for a specific category
	 */
	async fetchCategory(category: NewsCategory): Promise<NewsItem[]> {
		// Set loading state
		this.categories[category].loading = true;
		this.categories[category].error = null;
		this.emit({ type: 'loading', category });

		try {
			const items = await fetchCategoryNews(category);
			const enrichedItems = items.map((item) => this.enrichNewsItem(item));

			// Update state
			this.categories[category] = {
				items: enrichedItems,
				loading: false,
				error: null,
				lastUpdated: Date.now()
			};

			this.emit({ type: 'loaded', category, data: enrichedItems });
			return enrichedItems;
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : 'Unknown error';
			this.categories[category].loading = false;
			this.categories[category].error = errorMsg;
			this.emit({ type: 'error', category, error: errorMsg });
			throw error;
		}
	}

	/**
	 * Fetch all news categories
	 */
	async fetchAll(): Promise<Record<NewsCategory, NewsItem[]>> {
		const result = await fetchAllNews();

		// Update all categories
		for (const [category, items] of Object.entries(result) as [NewsCategory, NewsItem[]][]) {
			const enrichedItems = items.map((item) => this.enrichNewsItem(item));
			this.categories[category] = {
				items: enrichedItems,
				loading: false,
				error: null,
				lastUpdated: Date.now()
			};
			this.emit({ type: 'loaded', category, data: enrichedItems });
		}

		return result;
	}

	/**
	 * Get news for a specific category
	 */
	getNews(category: NewsCategory): NewsItem[] {
		return this.categories[category].items;
	}

	/**
	 * Get state for a specific category
	 */
	getCategoryState(category: NewsCategory): CategoryState {
		return this.categories[category];
	}

	/**
	 * Get all news items across all categories
	 */
	getAllNews(): NewsItem[] {
		const allItems: NewsItem[] = [];
		const cats: NewsCategory[] = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'];

		for (const category of cats) {
			allItems.push(...this.categories[category].items);
		}

		return allItems;
	}

	/**
	 * Get alert items (items with alert keywords)
	 */
	getAlerts(): NewsItem[] {
		const allItems = this.getAllNews();
		return allItems
			.filter((item) => item.isAlert)
			.sort((a, b) => b.timestamp - a.timestamp);
	}

	/**
	 * Filter news by region
	 */
	getNewsByRegion(region: string): NewsItem[] {
		const allItems = this.getAllNews();
		return allItems.filter((item) => item.region === region);
	}

	/**
	 * Filter news by topic
	 */
	getNewsByTopic(topic: string): NewsItem[] {
		const allItems = this.getAllNews();
		return allItems.filter((item) => item.topics?.includes(topic));
	}

	/**
	 * Check if any category is currently loading
	 */
	isAnyLoading(): boolean {
		const cats: NewsCategory[] = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'];
		return cats.some((cat) => this.categories[cat].loading);
	}

	/**
	 * Clear a specific category
	 */
	clearCategory(category: NewsCategory): void {
		this.categories[category] = {
			items: [],
			loading: false,
			error: null,
			lastUpdated: null
		};
	}

	/**
	 * Clear all categories
	 */
	clearAll(): void {
		this.categories = this.createInitialState();
	}
}
