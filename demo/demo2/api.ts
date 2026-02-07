/**
 * FRED API & Fed RSS - Federal Reserve Economic Data and News
 */

import type { EconomicIndicator, FedIndicators, FedNewsItem, FedNewsType } from './types';
import { FRED_API_KEY, FRED_BASE_URL, FED_BASE_URL, FED_RSS_FEEDS, CORS_PROXIES, logger } from './config';

// ============================================================================
// FRED Economic Data API
// ============================================================================

interface FredObservation {
	date: string;
	value: string;
}

interface FredSeriesResponse {
	observations: FredObservation[];
}

/**
 * Check if FRED API key is configured
 */
export function isFredConfigured(): boolean {
	return FRED_API_KEY.length > 0;
}

/**
 * Create an empty indicator (used for error/missing data states)
 */
function createEmptyIndicator(seriesId: string, name: string, unit: string): EconomicIndicator {
	return {
		seriesId,
		name,
		value: null,
		previousValue: null,
		change: null,
		unit,
		date: null
	};
}

/**
 * Fetch a single FRED series with the latest 2 observations
 */
async function fetchFredSeries(seriesId: string): Promise<FredObservation[]> {
	try {
		const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=2`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: FredSeriesResponse = await response.json();
		return data.observations || [];
	} catch (error) {
		logger.error('FRED API', `Error fetching series ${seriesId}:`, error);
		return [];
	}
}

/**
 * Parse FRED observation value (handles "." for missing data)
 */
function parseValue(obs: FredObservation | undefined): number | null {
	if (!obs || obs.value === '.') return null;
	const val = parseFloat(obs.value);
	return isNaN(val) ? null : val;
}

/**
 * Fetch Federal Funds Effective Rate
 * Series: FEDFUNDS (monthly)
 */
async function fetchFedFundsRate(): Promise<EconomicIndicator> {
	const seriesId = 'FEDFUNDS';
	const name = 'Fed Funds Rate';
	const unit = '%';

	if (!isFredConfigured()) {
		return createEmptyIndicator(seriesId, name, unit);
	}

	const observations = await fetchFredSeries(seriesId);
	const current = parseValue(observations[0]);
	const previous = parseValue(observations[1]);

	return {
		seriesId,
		name,
		value: current,
		previousValue: previous,
		change: current !== null && previous !== null ? current - previous : null,
		unit,
		date: observations[0]?.date || null
	};
}

/**
 * Fetch Consumer Price Index (Year-over-Year % Change)
 * Series: CPIAUCSL (monthly, we calculate YoY change)
 */
async function fetchCPI(): Promise<EconomicIndicator> {
	const seriesId = 'CPIAUCSL';
	const name = 'CPI Inflation';
	const unit = '%';

	if (!isFredConfigured()) {
		return createEmptyIndicator(seriesId, name, unit);
	}

	try {
		// Fetch 14 observations: current + 12 months ago, plus previous month + 13 months ago
		const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=14`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const data: FredSeriesResponse = await response.json();
		const observations = data.observations || [];

		if (observations.length < 13) {
			return createEmptyIndicator(seriesId, name, unit);
		}

		const currentCPI = parseValue(observations[0]);
		const yearAgoCPI = parseValue(observations[12]);
		const previousMonthCPI = parseValue(observations[1]);
		const prevYearAgoCPI = observations.length >= 14 ? parseValue(observations[13]) : yearAgoCPI;

		if (currentCPI === null || yearAgoCPI === null) {
			return createEmptyIndicator(seriesId, name, unit);
		}

		const yoyChange = ((currentCPI - yearAgoCPI) / yearAgoCPI) * 100;
		const prevYoyChange =
			previousMonthCPI !== null && prevYearAgoCPI !== null
				? ((previousMonthCPI - prevYearAgoCPI) / prevYearAgoCPI) * 100
				: null;

		return {
			seriesId,
			name,
			value: Math.round(yoyChange * 100) / 100,
			previousValue: prevYoyChange !== null ? Math.round(prevYoyChange * 100) / 100 : null,
			change: prevYoyChange !== null ? Math.round((yoyChange - prevYoyChange) * 100) / 100 : null,
			unit,
			date: observations[0]?.date || null
		};
	} catch (error) {
		logger.error('FRED API', 'Error fetching CPI:', error);
		return createEmptyIndicator(seriesId, name, unit);
	}
}

/**
 * Fetch 10-Year Treasury Constant Maturity Rate
 * Series: DGS10 (daily)
 */
async function fetchTreasury10Y(): Promise<EconomicIndicator> {
	const seriesId = 'DGS10';
	const name = '10Y Treasury';
	const unit = '%';

	if (!isFredConfigured()) {
		return createEmptyIndicator(seriesId, name, unit);
	}

	const observations = await fetchFredSeries(seriesId);
	const current = parseValue(observations[0]);
	const previous = parseValue(observations[1]);

	return {
		seriesId,
		name,
		value: current,
		previousValue: previous,
		change:
			current !== null && previous !== null ? Math.round((current - previous) * 100) / 100 : null,
		unit,
		date: observations[0]?.date || null
	};
}

/**
 * Fetch all Fed economic indicators
 */
export async function fetchFedIndicators(): Promise<FedIndicators> {
	logger.log('FRED API', 'Fetching Fed indicators');

	const [fedFundsRate, cpi, treasury10Y] = await Promise.all([
		fetchFedFundsRate(),
		fetchCPI(),
		fetchTreasury10Y()
	]);

	return { fedFundsRate, cpi, treasury10Y };
}

// ============================================================================
// Fed RSS News Fetching
// ============================================================================

/**
 * Simple hash for generating unique IDs
 */
function hashString(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(36);
}

/**
 * Fetch with CORS proxy fallback
 */
async function fetchWithProxy(url: string): Promise<Response> {
	const encodedUrl = encodeURIComponent(url);

	// Try primary proxy first
	try {
		const response = await fetch(CORS_PROXIES.primary + encodedUrl);
		if (response.ok) {
			return response;
		}
		logger.warn('API', `Primary proxy failed (${response.status}), trying fallback`);
	} catch (error) {
		logger.warn('API', 'Primary proxy error, trying fallback:', error);
	}

	// Fallback to secondary proxy
	return fetch(CORS_PROXIES.fallback + encodedUrl);
}

/**
 * Parse RSS XML and extract items
 */
function parseRssXml(xml: string, type: FedNewsType, typeLabel: string): FedNewsItem[] {
	const items: FedNewsItem[] = [];

	// Simple regex-based XML parsing for RSS items
	const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
	const titleRegex = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i;
	const linkRegex = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i;
	const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i;
	const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/i;

	let match;
	while ((match = itemRegex.exec(xml)) !== null) {
		const itemXml = match[1];

		const titleMatch = titleRegex.exec(itemXml);
		const linkMatch = linkRegex.exec(itemXml);
		const descMatch = descRegex.exec(itemXml);
		const pubDateMatch = pubDateRegex.exec(itemXml);

		const title = titleMatch?.[1]?.trim() || '';
		const link = linkMatch?.[1]?.trim() || '';
		const description = descMatch?.[1]?.trim().replace(/<[^>]*>/g, '') || '';
		const pubDate = pubDateMatch?.[1]?.trim() || '';

		if (!title || !link) continue;

		const fullText = `${title} ${description}`.toLowerCase();
		const isPowellRelated = type === 'powell' || /powell|chair(?:man)?/.test(fullText);
		const hasVideo = /video|webcast|watch|broadcast|live/.test(fullText);

		items.push({
			id: `fed-${type}-${hashString(link)}`,
			title,
			link: link.startsWith('http') ? link : `${FED_BASE_URL}${link}`,
			description,
			pubDate,
			timestamp: pubDate ? new Date(pubDate).getTime() : Date.now(),
			type,
			typeLabel,
			isPowellRelated,
			hasVideo
		});
	}

	return items;
}

/**
 * Fetch a single Fed RSS feed
 */
async function fetchFedRssFeed(
	url: string,
	type: FedNewsType,
	typeLabel: string
): Promise<FedNewsItem[]> {
	try {
		logger.log('Fed RSS', `Fetching ${typeLabel} from ${url}`);
		const response = await fetchWithProxy(url);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}

		const xml = await response.text();
		return parseRssXml(xml, type, typeLabel);
	} catch (error) {
		logger.error('Fed RSS', `Error fetching ${typeLabel}:`, error);
		return [];
	}
}

/**
 * Fetch all Fed news from RSS feeds
 */
export async function fetchFedNews(): Promise<FedNewsItem[]> {
	logger.log('Fed RSS', 'Fetching all Fed news feeds');

	const results = await Promise.all(
		FED_RSS_FEEDS.map((feed) => fetchFedRssFeed(feed.url, feed.type, feed.label))
	);

	// Flatten and dedupe by link
	const seen = new Set<string>();
	const allItems: FedNewsItem[] = [];

	for (const items of results) {
		for (const item of items) {
			if (!seen.has(item.link)) {
				seen.add(item.link);
				allItems.push(item);
			}
		}
	}

	// Sort by timestamp (newest first), with Powell items boosted
	return allItems.sort((a, b) => {
		// Powell items get priority
		if (a.isPowellRelated && !b.isPowellRelated) return -1;
		if (!a.isPowellRelated && b.isPowellRelated) return 1;
		// Then by timestamp
		return b.timestamp - a.timestamp;
	});
}
