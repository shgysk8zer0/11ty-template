import { HermesWorker } from '{{ importmap.imports["@aegisjsproject/hermes/"] }}worker.js';

const staticDirs = ['js', 'css', 'img', '.well-known'];

new HermesWorker([
	{
		name: '{{ pkg.name | slugify }}',
		version: '{{ app.version | default: pkg.version }}',
		strategy: 'network-first',
		pattern: new URLPattern({
			baseURL: location.origin,
			pathname: `/((?!(?:${staticDirs.join('|')}|api)/).*)`
		}),
	}, {
		name: '{{ pkg.name | slugify }}-assets',
		version: '{{ app.version | default: pkg.version }}',
		strategy: 'stale-while-revalidate',
		pattern: new URLPattern({
			baseURL: location.origin,
			pathname: `/(${staticDirs.join('|')})/*`,
		}),
		prefetch: [
			'/js/index.min.js', '/css/index.min.css', '/img/icons.svg', '/img/favicon.svg',
		].map(path => URL.parse(path, location.origin)),
	}, {
		name: 'unpkg',
		strategy: 'cache-first',
		pattern: new URLPattern({ baseURL: 'https://unpkg.com/', pathname: '/*' }),
		prefetch: [
			'{{ importmap.imports["@aegisjsproject/router"] }}',
			'{{ importmap.imports["@aegisjsproject/idb"] }}',
			'{{ importmap.imports["@aegisjsproject/core/"] }}parsers/html.js',
			'{{ importmap.imports["@aegisjsproject/core/"] }}parsers/css.js',
			'{{ importmap.imports["@aegisjsproject/core/"] }}stringify.js',
			'{{ importmap.imports["@aegisjsproject/core/"] }}dom.js',
			'{{ importmap.imports["@aegisjsproject/markdown"] }}',
			'{{ importmap.imports["@aegisjsproject/url/"] }}search.js',
			'{{ importmap.imports["@aegisjsproject/callback-registry/"] }}callbackRegistry.js',
			'{{ importmap.imports["@aegisjsproject/callback-registry/"] }}callbacks.js',
			'{{ importmap.imports["@aegisjsproject/callback-registry/"] }}events.js',
			'{{ importmap.imports["@aegisjsproject/state/"] }}state.js',
			'{{ importmap.imports["@aegisjsproject/state"] }}',
			'{{ importmap.imports["@aegisjsproject/firebase-account-routes"] }}',
			'{{ importmap.imports["@aegisjsproject/firebase-account-routes/"] }}auth.js',
			'{{ importmap.imports["@aegisjsproject/disposable-registry"] }}',
		]
	}, {
		name: 'imgur',
		strategy: 'cache-first',
		pattern: new URLPattern({
			baseURL: 'https://i.imgur.com',
			pathname: '/*',
		}),
	}, {
		name: 'google-static',
		strategy: 'cache-first',
		pattern: new URLPattern({
			hostname: '(.*\\.)?(firebaseio\\.com|firebaseapp\\.com|web\\.app|firebasestorage\\.googleapis\\.com|fonts\\.googleapis\\.com|gstatic\\.com)',
			pathname: '/(.*\\.(?:js|css|woff2?|ttf|otf|eot))',
		}),
	},
]);
