/* eslint-env node */
import terser from '@rollup/plugin-terser';
import { rollupImport } from '@shgysk8zer0/rollup-import';

export default {
	input: 'js/index.js',
	external: [],
	onwarn: (warning) => {
		if (warning.code === 'MISSING_GLOBAL_NAME') {
			throw new Error(warning.message);
		} else if (warning.code !== 'CIRCULAR_DEPENDENCY') {
			console.warn(`(!) ${warning.message}`);
		}
	},
	output: {
		file: 'js/index.min.js',
		format: 'iife',
		sourcemap: true,
		globals: {},
	},
	plugins: [
		rollupImport(['_data/importmap.yml']),
		terser(),
	],
};
