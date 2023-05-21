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
	const importCache = new Map();
	const importMapPromise = readFile('_data/importmap.yml', { encoding: 'utf8' })
		.then(content => load(content));

	const read_file = file => readFile(normalize(file), { encoding: 'utf8' });

	const resolve_specifier =  input => {
		if (['https:','http:', '//', '/', './', '../'].some(pre => input.startsWith(pre))) {
			return Promise.resolve(input);
		} else if (importCache.has(input)) {
			return Promise.resolve(importCache.get(input));
		} else {
			return importMapPromise.then(({ imports }) => {
				if (imports.hasOwnProperty(input)) {
					importCache.set(input, imports[input]);
					return imports[input];
				} else {
					let found = false
					const match = Object.keys(imports).filter(spec => spec.endsWith('/')).reduce((longest, cur) => {
						if (! found && input.startsWith(cur)) {
							found = true;
							return cur;
						} else if (found && input.startsWith(cur) && cur.length > longest.length) {
							return cur;
						} else {
							return longest;
						}
					}, null);

					if (found) {
						const resolved = input.replace(match, imports[match]);
						importCache.set(input, resolved);
						return resolved;
					} else {
						throw new TypeError(`${input} could not be mapped`);
					}
				}
			}).catch(console.error);
		}
	};

	const sha512 = input => {
		const hash = createHash('sha512');
		hash.update(input, 'utf8');
		return `sha384-${hash.digest('hex')}`;
	};

	const sha384 = input => {
		const hash = createHash('sha384');
		hash.update(input, 'utf8');
		return hash.digest('hex');
	};

	const sha256 = input => {
		const hash = createHash('sha256');
		hash.update(input, 'utf8');
		return hash.digest('hex');
	};

	const md5 = input => {
		const hash = createHash('md5');
		hash.update(input, 'utf8');
		return hash.digest('hex');
	};

	const sri = input => {
		if (sris.has(input)) {
			return sris.get(input);
		} else {
			const hash = createHash('sha384');
			hash.update(input, 'utf8');
			const sri = `sha384-${hash.digest('base64')}`;
			sris.set(input, sri);
			return sri;
		}
	};

	// {{ myVar | jsonify }}
	eleventyConfig.addFilter('jsonify', input => JSON.stringify(input));
	eleventyConfig.addFilter('read_file', read_file);
	eleventyConfig.addFilter('date_to_iso', input => new Date(input).toISOString());
	eleventyConfig.addFilter('absolute_url', input => new URL(input, site.url).href);
	eleventyConfig.addFilter('escape_xml', escape);
	eleventyConfig.addFilter('is_array', input => Array.isArray(input));
	eleventyConfig.addFilter('is_string', input => typeof input === 'string');
	eleventyConfig.addFilter('is_null', input => typeof input === 'object' && Object.is(input, null));
	eleventyConfig.addFilter('resolve_specifier', resolve_specifier);
	eleventyConfig.addFilter('sha512', sha512);
	eleventyConfig.addFilter('sha384', sha384);
	eleventyConfig.addFilter('sha256', sha256);
	eleventyConfig.addFilter('md5', md5);
	eleventyConfig.addFilter('sri', sri);

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
