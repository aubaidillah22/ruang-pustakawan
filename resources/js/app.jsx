import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'RuangPustakawan';

// Expose user for Echo channels
const pageData = document.querySelector('[data-page]');
if (pageData) {
    try {
        const page = JSON.parse(pageData.getAttribute('data-page'));
        window.__user = page.props?.auth?.user || null;
    } catch (e) {
        console.warn('Could not parse page data for Echo setup');
    }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#3b82f6',
        showSpinner: true,
    },
});
