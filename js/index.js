import '@shgysk8zer0/kazoo/theme-cookie.js';
import { getGooglePolicy } from '@shgysk8zer0/kazoo/trust-policies.js';
import { toggleClass, on } from '@shgysk8zer0/kazoo/dom.js';
import { init } from '@shgysk8zer0/kazoo/data-handlers.js';
import { importGa, externalHandler, telHandler, mailtoHandler } from '@shgysk8zer0/kazoo/google-analytics.js';
import { submitHandler } from './contact-demo.js';
import { GA } from './consts.js';
import './components.js';

toggleClass([document.documentElement], {
	'no-dialog': document.createElement('dialog') instanceof HTMLUnknownElement,
	'no-details': document.createElement('details') instanceof HTMLUnknownElement,
	'js': true,
	'no-js': false,
});

if (typeof GA === 'string' && GA.length !== 0) {
	scheduler.postTask(() => {
		importGa(GA, {}, { policy: getGooglePolicy() }).then(async ({ ga, hasGa }) => {
			if (hasGa()) {
				ga('create', GA, 'auto');
				ga('set', 'transport', 'beacon');
				ga('send', 'pageview');

				on('a[rel~="external"]', ['click'], externalHandler, { passive: true, capture: true });
				on('a[href^="tel:"]', ['click'], telHandler, { passive: true, capture: true });
				on('a[href^="mailto:"]', ['click'], mailtoHandler, { passive: true, capture: true });
			}
		});
	}, { priority: 'background' });
}

if (location.pathname.startsWith('/contact')) {
	on('#contact-form', ['submit'], submitHandler);
}

init();
