/* eslint-env node */
const { escape } = require("nunjucks/src/filters");
const { load } = require('js-yaml');

const filters = require('./11ty-filters.cjs');

module.exports = function(eleventyConfig) {
	const site = {
		title: '11ty Test',
		description: 'A test of Eleventy',
		repository: { username: 'kernvalley', project: '11ty-template' },
		url: process.env.ELEVENTY_RUN_MODE === 'build' ? 'https://localhost:8080/' : 'https://example.com',
		viewport: 'width=device-width',
		referrer: 'no-referrer',
		'color-scheme': 'light dark',
		'og-type': 'website',
		base: '/',
		manifest: '/webapp.webmanifest',
		service_worker: '/service-worker.js',
		'keep-kern-clean': true,
	};

	// {{ myVar | jsonify }}
	eleventyConfig.addFilter('absolute_url', input => new URL(input, site.url).href);
	Object.entries(filters).forEach(([filter, cb]) => eleventyConfig.addFilter(filter, cb));

	eleventyConfig.addFilter('is_icon', list => {
		return JSON.stringify(list.filter(icon => typeof icon.purpose === 'string'));
	});

	// Add `_data/*.yml` & `_data/*.yaml` parsing as data files
	eleventyConfig.addDataExtension('yaml', contents => load(contents));
	eleventyConfig.addDataExtension('yml', contents => load(contents));

	// These directories get copied to `_site/`
	eleventyConfig.addPassthroughCopy('js');
	eleventyConfig.addPassthroughCopy('css');
	eleventyConfig.addPassthroughCopy('img');
	eleventyConfig.addPassthroughCopy('_redirects');
	eleventyConfig.addPassthroughCopy('robots.txt');

	// Not including file extensions is slower, so alias theme
	eleventyConfig.addLayoutAlias('post', '11ty-layouts/post.html');
	eleventyConfig.addLayoutAlias('default', '11ty-layouts/default.html');

	// Set global data/variables
	// {{ environment }} -> 'production' | 'development'
	eleventyConfig.addGlobalData('environment',
		process.env.ELEVENTY_RUN_MODE === 'build'
			? 'production'
			: 'development'
	);

	// {% if dev %}
	eleventyConfig.addGlobalData('dev', process.env.ELEVENTY_RUN_MODE === 'build');
	eleventyConfig.addGlobalData('site', site);

	return {
		dir: {
			includes: '_includes',
			layouts: '_layouts',
			data: '_data',
			output: '_site',
			dynamicPartials: false,
			jekyllInclude: true,
			extname: '.html',
		}
	};
}
