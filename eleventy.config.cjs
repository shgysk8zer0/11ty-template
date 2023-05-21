/* eslint-env node */
const { normalize } = require('node:path');
const { promises: { readFile }} = require('node:fs');
const { createHash } = require('node:crypto');
const { load } = require('js-yaml');
const { escape } = require("nunjucks/src/filters");

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

	const sris = new Map();

	// {{ myVar | jsonify }}
	eleventyConfig.addFilter('jsonify', input => JSON.stringify(input));
	eleventyConfig.addFilter('read_file', file => readFile(normalize(file, { encoding: 'utf8' })));
	eleventyConfig.addFilter('date_to_iso', input => new Date(input).toISOString());
	eleventyConfig.addFilter('absolute_url', input => new URL(input, site.url).href);
	eleventyConfig.addFilter('escape_xml', escape);
	eleventyConfig.addFilter('is_array', input => Array.isArray(input));
	eleventyConfig.addFilter('is_string', input => typeof input === 'string');
	eleventyConfig.addFilter('is_null', input => typeof input === 'object' && Object.is(input, null));

	eleventyConfig.addFilter('sha512', input => {
		const hash = createHash('sha512');
		hash.update(input, 'utf8');
		return `sha384-${hash.digest('hex')}`;
	});

	eleventyConfig.addFilter('sri', input => {
		if (sris.has(input)) {
			return sris.get(input);
		} else {
			const hash = createHash('sha384');
			hash.update(input, 'utf8');
			const sri = `sha384-${hash.digest('base64')}`;
			sris.set(input, sri);
			return sri;
		}
	});

	eleventyConfig.addFilter('sha384', input => {
		const hash = createHash('sha384');
		hash.update(input, 'utf8');
		return hash.digest('hex');
	});

	eleventyConfig.addFilter('sha256', input => {
		const hash = createHash('sha256');
		hash.update(input, 'utf8');
		return hash.digest('hex');
	});

	eleventyConfig.addFilter('md5', input => {
		const hash = createHash('md5');
		hash.update(input, 'utf8');
		return hash.digest('hex');
	});

	eleventyConfig.addFilter('is_icon', list => {
		return JSON.stringify(list.filter(icon => typeof icon.purpose === 'string'));
	});

	eleventyConfig.addFilter('fetch_json', url => fetch(url).then(resp => resp.json()));
	eleventyConfig.addFilter('fetch_text', url => fetch(url).then(resp => resp.text()));

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
