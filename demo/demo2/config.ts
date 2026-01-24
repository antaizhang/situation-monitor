/**
 * Configuration for Federal Reserve Monitor
 */

/**
 * FRED API Configuration
 * Get your free API key at: https://fred.stlouisfed.org/docs/api/api_key.html
 */
export const FRED_API_KEY = process.env.FRED_API_KEY || '';
export const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

/**
 * Federal Reserve base URL for RSS feeds
 */
export const FED_BASE_URL = 'https://www.federalreserve.gov';

/**
 * Fed RSS feed configuration
 */
export const FED_RSS_FEEDS = [
	{
		url: `${FED_BASE_URL}/feeds/press_monetary.xml`,
		type: 'monetary' as const,
		label: 'Monetary Policy'
	},
	{
		url: `${FED_BASE_URL}/feeds/s_t_powell.xml`,
		type: 'powell' as const,
		label: 'Chair Powell'
	},
	{
		url: `${FED_BASE_URL}/feeds/speeches.xml`,
		type: 'speech' as const,
		label: 'Speeches'
	},
	{
		url: `${FED_BASE_URL}/feeds/testimony.xml`,
		type: 'testimony' as const,
		label: 'Testimony'
	},
	{
		url: `${FED_BASE_URL}/feeds/press_other.xml`,
		type: 'announcement' as const,
		label: 'Announcements'
	}
] as const;

/**
 * CORS proxy URLs for bypassing CORS restrictions
 */
export const CORS_PROXIES = {
	primary: 'https://situation-monitor-proxy.seanthielen-e.workers.dev/?url=',
	fallback: 'https://corsproxy.io/?url='
} as const;

/**
 * Simple logger
 */
export const logger = {
	log: (prefix: string, ...args: unknown[]) => {
		console.log(`[${prefix}]`, ...args);
	},
	warn: (prefix: string, ...args: unknown[]) => {
		console.warn(`[${prefix}]`, ...args);
	},
	error: (prefix: string, ...args: unknown[]) => {
		console.error(`[${prefix}]`, ...args);
	}
};
