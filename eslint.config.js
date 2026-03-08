import { browser } from '@shgysk8zer0/eslint-config';
import { frontmatter } from 'eslint-plugin-frontmatter2';

export default browser({
	ignores: ['**/*.min.js', '**/*.cjs', 'assets/dedent.js','assets/url-pattern.js'],
	plugins: { frontmatter2: frontmatter },
	processor: 'frontmatter2/frontmatter',
});
