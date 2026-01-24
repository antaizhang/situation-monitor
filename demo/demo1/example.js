/**
 * Example usage of GDELT News Aggregator
 *
 * Run with: node example.js
 */

import { NewsAggregator } from './NewsAggregator.js';

async function main() {
	console.log('=== GDELT News Aggregator Demo ===\n');

	// Create aggregator instance
	const aggregator = new NewsAggregator();

	// Subscribe to events
	aggregator.on('loading', (event) => {
		console.log(`📡 Loading ${event.category}...`);
	});

	aggregator.on('loaded', (event) => {
		console.log(`✅ Loaded ${event.data?.length || 0} articles for ${event.category}`);
	});

	aggregator.on('error', (event) => {
		console.error(`❌ Error loading ${event.category}: ${event.error}`);
	});

	// Example 1: Fetch a single category
	console.log('\n--- Example 1: Fetch Politics News ---');
	try {
		await aggregator.fetchCategory('politics');
		const politicsNews = aggregator.getNews('politics');
		console.log('\nTop 5 Politics Headlines:');
		politicsNews.slice(0, 5).forEach((item, i) => {
			const alertTag = item.isAlert ? '🚨' : '';
			const regionTag = item.region ? `[${item.region}]` : '';
			console.log(`${i + 1}. ${alertTag} ${regionTag} ${item.title}`);
			console.log(`   Source: ${item.source} | ${item.link}`);
		});
	} catch (error) {
		console.error('Error:', error.message);
	}

	// Example 2: Fetch all categories
	console.log('\n\n--- Example 2: Fetch All News ---');
	try {
		await aggregator.fetchAll();

		const stats = ['politics', 'tech', 'finance', 'gov', 'ai', 'intel'].map((cat) => {
			const news = aggregator.getNews(cat);
			return `${cat}: ${news.length} items`;
		});

		console.log('\nCategory Statistics:');
		stats.forEach((stat) => console.log(`  - ${stat}`));
	} catch (error) {
		console.error('Error:', error.message);
	}

	// Example 3: Get alerts
	console.log('\n\n--- Example 3: Get Alert Items ---');
	const alerts = aggregator.getAlerts();
	console.log(`\nFound ${alerts.length} alert items:`);
	alerts.slice(0, 5).forEach((item, i) => {
		console.log(
			`${i + 1}. 🚨 [${item.alertKeyword}] ${item.title.substring(0, 80)}...`
		);
	});

	// Example 4: Filter by region
	console.log('\n\n--- Example 4: Filter by Region (MENA) ---');
	const menaNews = aggregator.getNewsByRegion('MENA');
	console.log(`\nFound ${menaNews.length} MENA-related items:`);
	menaNews.slice(0, 3).forEach((item, i) => {
		console.log(`${i + 1}. [${item.category}] ${item.title.substring(0, 80)}...`);
	});

	// Example 5: Filter by topic
	console.log('\n\n--- Example 5: Filter by Topic (CYBER) ---');
	const cyberNews = aggregator.getNewsByTopic('CYBER');
	console.log(`\nFound ${cyberNews.length} CYBER-related items:`);
	cyberNews.slice(0, 3).forEach((item, i) => {
		console.log(`${i + 1}. [${item.category}] ${item.title.substring(0, 80)}...`);
	});

	// Example 6: Get category state
	console.log('\n\n--- Example 6: Category State ---');
	const techState = aggregator.getCategoryState('tech');
	console.log('Tech Category State:', {
		itemCount: techState.items.length,
		loading: techState.loading,
		error: techState.error,
		lastUpdated: techState.lastUpdated
			? new Date(techState.lastUpdated).toLocaleString()
			: null
	});

	console.log('\n=== Demo Complete ===');
}

main().catch(console.error);
