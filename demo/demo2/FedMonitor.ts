/**
 * Federal Reserve Monitor - Framework-agnostic Fed data monitoring class
 */

import type { FedIndicators, FedNewsItem, IndicatorsState, NewsState } from './types';
import { fetchFedIndicators, fetchFedNews, isFredConfigured } from './api';

export type FedEventType = 'indicators-loading' | 'indicators-loaded' | 'news-loading' | 'news-loaded' | 'error';

export interface FedEvent {
	type: FedEventType;
	data?: FedIndicators | FedNewsItem[];
	error?: string;
}

export type FedEventHandler = (event: FedEvent) => void;

/**
 * Federal Reserve Monitor Class
 *
 * A framework-agnostic class for monitoring Federal Reserve economic indicators and news.
 * Can be used in React, Vue, Angular, or vanilla JavaScript.
 *
 * Features:
 * - Economic Indicators: Fed Funds Rate, CPI Inflation, 10Y Treasury
 * - Fed News: Monetary policy, Powell speeches, testimony, announcements
 * - Event-driven architecture for reactive updates
 *
 * @example
 * ```typescript
 * const monitor = new FedMonitor();
 *
 * // Subscribe to events
 * monitor.on('indicators-loaded', (event) => {
 *   console.log('Indicators:', event.data);
 * });
 *
 * // Fetch data
 * await monitor.fetchIndicators();
 * await monitor.fetchNews();
 *
 * // Get data
 * const indicators = monitor.getIndicators();
 * const news = monitor.getNews();
 * ```
 */
export class FedMonitor {
	private indicatorsState: IndicatorsState;
	private newsState: NewsState;
	private eventHandlers: Map<FedEventType, Set<FedEventHandler>>;

	constructor() {
		this.indicatorsState = {
			data: null,
			loading: false,
			error: null,
			lastUpdated: null
		};

		this.newsState = {
			items: [],
			loading: false,
			error: null,
			lastUpdated: null
		};

		this.eventHandlers = new Map();
	}

	/**
	 * Emit an event to all registered handlers
	 */
	private emit(event: FedEvent): void {
		const handlers = this.eventHandlers.get(event.type);
		if (handlers) {
			handlers.forEach((handler) => handler(event));
		}
	}

	/**
	 * Subscribe to events
	 */
	on(type: FedEventType, handler: FedEventHandler): () => void {
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
	 * Check if FRED API is configured
	 */
	isFredConfigured(): boolean {
		return isFredConfigured();
	}

	/**
	 * Fetch economic indicators from FRED
	 */
	async fetchIndicators(): Promise<FedIndicators> {
		this.indicatorsState.loading = true;
		this.indicatorsState.error = null;
		this.emit({ type: 'indicators-loading' });

		try {
			const data = await fetchFedIndicators();

			this.indicatorsState = {
				data,
				loading: false,
				error: null,
				lastUpdated: Date.now()
			};

			this.emit({ type: 'indicators-loaded', data });
			return data;
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : 'Unknown error';
			this.indicatorsState.loading = false;
			this.indicatorsState.error = errorMsg;
			this.emit({ type: 'error', error: errorMsg });
			throw error;
		}
	}

	/**
	 * Fetch Fed news from RSS feeds
	 */
	async fetchNews(): Promise<FedNewsItem[]> {
		this.newsState.loading = true;
		this.newsState.error = null;
		this.emit({ type: 'news-loading' });

		try {
			const items = await fetchFedNews();

			this.newsState = {
				items,
				loading: false,
				error: null,
				lastUpdated: Date.now()
			};

			this.emit({ type: 'news-loaded', data: items });
			return items;
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : 'Unknown error';
			this.newsState.loading = false;
			this.newsState.error = errorMsg;
			this.emit({ type: 'error', error: errorMsg });
			throw error;
		}
	}

	/**
	 * Fetch both indicators and news
	 */
	async fetchAll(): Promise<{ indicators: FedIndicators; news: FedNewsItem[] }> {
		const [indicators, news] = await Promise.all([this.fetchIndicators(), this.fetchNews()]);
		return { indicators, news };
	}

	/**
	 * Get current economic indicators
	 */
	getIndicators(): FedIndicators | null {
		return this.indicatorsState.data;
	}

	/**
	 * Get indicators state (including loading/error)
	 */
	getIndicatorsState(): IndicatorsState {
		return this.indicatorsState;
	}

	/**
	 * Get Fed news items
	 */
	getNews(): FedNewsItem[] {
		return this.newsState.items;
	}

	/**
	 * Get news state (including loading/error)
	 */
	getNewsState(): NewsState {
		return this.newsState;
	}

	/**
	 * Filter news by type
	 */
	getNewsByType(type: string): FedNewsItem[] {
		return this.newsState.items.filter((item) => item.type === type);
	}

	/**
	 * Get Powell-related news
	 */
	getPowellNews(): FedNewsItem[] {
		return this.newsState.items.filter((item) => item.isPowellRelated);
	}

	/**
	 * Get news with videos
	 */
	getVideoNews(): FedNewsItem[] {
		return this.newsState.items.filter((item) => item.hasVideo);
	}

	/**
	 * Check if any data is currently loading
	 */
	isLoading(): boolean {
		return this.indicatorsState.loading || this.newsState.loading;
	}

	/**
	 * Clear all data
	 */
	clearAll(): void {
		this.indicatorsState = {
			data: null,
			loading: false,
			error: null,
			lastUpdated: null
		};

		this.newsState = {
			items: [],
			loading: false,
			error: null,
			lastUpdated: null
		};
	}
}
