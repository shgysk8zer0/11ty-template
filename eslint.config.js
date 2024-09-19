import { ignoreFile } from '@shgysk8zer0/eslint-config/ignoreFile.js';
import browser from '@shgysk8zer0/eslint-config/browser.js';
import { frontmatter } from 'eslint-plugin-frontmatter2';

export default [ignoreFile, browser({
	files: ['*.js', 'js/*.js', 'js/*/*.js' ],
	ignores: ['**/*.min.js'],
	plugins: { frontmatter2: frontmatter },
	processor: 'frontmatter2/frontmatter',
})];
