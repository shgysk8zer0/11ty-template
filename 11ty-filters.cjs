const { normalize } = require('node:path');
const { promises: { readFile }} = require('node:fs');
const { createHash } = require('node:crypto');
const { load } = require('js-yaml');

const sris = new Map();
const importCache = new Map();
const importMapPromise = readFile('_data/importmap.yml', { encoding: 'utf8' })
	.then(content => load(content));

const read_file = file => readFile(normalize(file), { encoding: 'utf8' });

const date_to_iso = input => new Date(input).toISOString();

const jsonify = input => JSON.stringify(input);

const is_array = input => Array.isArray(input);

const is_string = input => typeof input === 'string';

const fetch_json = url => fetch(url).then(resp => resp.json());

const fetch_text = url => fetch(url).then(resp => resp.text());

const is_null = input => typeof input === 'object' && Object.is(input, null);

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

module.exports = {
	read_file, resolve_specifier, sha512, sha384, sha256, md5, sri, jsonify,
	date_to_iso, is_array, is_string, is_null, fetch_json, fetch_text,
};
