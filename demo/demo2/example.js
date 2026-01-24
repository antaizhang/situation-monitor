/**
 * Example usage of Federal Reserve Monitor
 *
 * Before running:
 * 1. Get a free FRED API key from https://fred.stlouisfed.org/docs/api/api_key.html
 * 2. Set environment variable: export FRED_API_KEY=your_key_here
 * 3. Run with: node example.js
 */

import { FedMonitor } from './FedMonitor.js';

async function main() {
	console.log('=== Federal Reserve Monitor Demo ===\n');

	// Create monitor instance
	const monitor = new FedMonitor();

	// Check if FRED API is configured
	if (!monitor.isFredConfigured()) {
		console.warn('⚠️  FRED API key not configured!');
		console.log('Get your free key at: https://fred.stlouisfed.org/docs/api/api_key.html');
		console.log('Then set: export FRED_API_KEY=your_key_here\n');
	}

	// Subscribe to events
	monitor.on('indicators-loading', () => {
		console.log('📊 Loading economic indicators...');
	});

	monitor.on('indicators-loaded', (event) => {
		console.log('✅ Economic indicators loaded');
	});

	monitor.on('news-loading', () => {
		console.log('📰 Loading Fed news...');
	});

	monitor.on('news-loaded', (event) => {
		console.log(`✅ Loaded ${event.data?.length || 0} Fed news items`);
	});

	monitor.on('error', (event) => {
		console.error(`❌ Error: ${event.error}`);
	});

	// Example 1: Fetch Economic Indicators
	console.log('\n--- Example 1: Economic Indicators ---');
	try {
		await monitor.fetchIndicators();
		const indicators = monitor.getIndicators();

		if (indicators) {
			console.log('\n📊 Federal Reserve Economic Indicators:\n');

			// Fed Funds Rate
			const ffr = indicators.fedFundsRate;
			console.log(`💰 ${ffr.name}: ${ffr.value !== null ? ffr.value + ffr.unit : 'N/A'}`);
			if (ffr.change !== null) {
				const arrow = ffr.change > 0 ? '↑' : ffr.change < 0 ? '↓' : '→';
				console.log(`   Change: ${arrow} ${ffr.change}${ffr.unit} (from ${ffr.previousValue}${ffr.unit})`);
			}
			console.log(`   Last Updated: ${ffr.date || 'N/A'}`);

			// CPI
			const cpi = indicators.cpi;
			console.log(`\n📈 ${cpi.name} (YoY): ${cpi.value !== null ? cpi.value + cpi.unit : 'N/A'}`);
			if (cpi.change !== null) {
				const arrow = cpi.change > 0 ? '↑' : cpi.change < 0 ? '↓' : '→';
				console.log(`   Change: ${arrow} ${cpi.change}${cpi.unit} (from ${cpi.previousValue}${cpi.unit})`);
			}
			console.log(`   Last Updated: ${cpi.date || 'N/A'}`);

			// 10Y Treasury
			const t10 = indicators.treasury10Y;
			console.log(`\n💵 ${t10.name}: ${t10.value !== null ? t10.value + t10.unit : 'N/A'}`);
			if (t10.change !== null) {
				const arrow = t10.change > 0 ? '↑' : t10.change < 0 ? '↓' : '→';
				console.log(`   Change: ${arrow} ${t10.change}${t10.unit} (from ${t10.previousValue}${t10.unit})`);
			}
			console.log(`   Last Updated: ${t10.date || 'N/A'}`);
		}
	} catch (error) {
		console.error('Error fetching indicators:', error.message);
	}

	// Example 2: Fetch Fed News
	console.log('\n\n--- Example 2: Fed News & Announcements ---');
	try {
		await monitor.fetchNews();
		const news = monitor.getNews();

		console.log(`\nTop 10 Fed News Items:\n`);
		news.slice(0, 10).forEach((item, i) => {
			const powellTag = item.isPowellRelated ? '🎙️ ' : '';
			const videoTag = item.hasVideo ? '📹 ' : '';
			console.log(`${i + 1}. ${powellTag}${videoTag}[${item.typeLabel}] ${item.title}`);
			console.log(`   ${item.link}`);
			console.log(`   Date: ${new Date(item.timestamp).toLocaleDateString()}\n`);
		});
	} catch (error) {
		console.error('Error fetching news:', error.message);
	}

	// Example 3: Powell-specific news
	console.log('\n--- Example 3: Chair Powell News ---');
	const powellNews = monitor.getPowellNews();
	console.log(`\nFound ${powellNews.length} Powell-related items:`);
	powellNews.slice(0, 5).forEach((item, i) => {
		console.log(`${i + 1}. 🎙️  ${item.title}`);
	});

	// Example 4: Video content
	console.log('\n\n--- Example 4: Video Content ---');
	const videoNews = monitor.getVideoNews();
	console.log(`\nFound ${videoNews.length} items with video:`);
	videoNews.slice(0, 3).forEach((item, i) => {
		console.log(`${i + 1}. 📹 ${item.title}`);
		console.log(`   ${item.link}\n`);
	});

	// Example 5: Filter by type
	console.log('\n--- Example 5: Monetary Policy Announcements ---');
	const monetaryNews = monitor.getNewsByType('monetary');
	console.log(`\nFound ${monetaryNews.length} monetary policy items:`);
	monetaryNews.slice(0, 3).forEach((item, i) => {
		console.log(`${i + 1}. ${item.title}`);
	});

	// Example 6: State inspection
	console.log('\n\n--- Example 6: Monitor State ---');
	const indicatorsState = monitor.getIndicatorsState();
	const newsState = monitor.getNewsState();

	console.log('Indicators State:', {
		hasData: indicatorsState.data !== null,
		loading: indicatorsState.loading,
		error: indicatorsState.error,
		lastUpdated: indicatorsState.lastUpdated
			? new Date(indicatorsState.lastUpdated).toLocaleString()
			: null
	});

	console.log('\nNews State:', {
		itemCount: newsState.items.length,
		loading: newsState.loading,
		error: newsState.error,
		lastUpdated: newsState.lastUpdated
			? new Date(newsState.lastUpdated).toLocaleString()
			: null
	});

	console.log('\n=== Demo Complete ===');
}

main().catch(console.error);
