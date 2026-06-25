<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <script>
            function updateFavicon() {
                const root = document.documentElement;
                const style = getComputedStyle(root);
                const primary = style.getPropertyValue('--primary').trim() || '#1e40af';
                const primaryDark = style.getPropertyValue('--primary-dark').trim() || '#1e3a8a';
                const accent = style.getPropertyValue('--accent').trim() || '#059669';

                const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="15" fill="${primary}" opacity="0.08"/>
                    <path d="M7 10 C7 8, 9 7, 11 7 L16 7 L16 25 L11 25 C9 25, 7 24, 7 22 Z" fill="${primaryDark}"/>
                    <path d="M16 7 L21 7 C23 7, 25 8, 25 10 L25 22 C25 24, 23 25, 21 25 L16 25 Z" fill="${primary}"/>
                    <rect x="15.3" y="7" width="1.4" height="18" rx="0.5" fill="${primaryDark}"/>
                    <path d="M15.5 8.5 L15.5 15 L13 13 L10.5 15 L10.5 8.5" fill="${accent}" stroke="${accent}" stroke-width="0.3"/>
                    <line x1="9" y1="13" x2="14.5" y2="13" stroke="#ffffff" stroke-width="0.6" opacity="0.35"/>
                    <line x1="9" y1="16" x2="14.5" y2="16" stroke="#ffffff" stroke-width="0.6" opacity="0.35"/>
                    <line x1="9" y1="19" x2="14.5" y2="19" stroke="#ffffff" stroke-width="0.6" opacity="0.35"/>
                    <line x1="17.5" y1="13" x2="23" y2="13" stroke="#ffffff" stroke-width="0.6" opacity="0.35"/>
                    <line x1="17.5" y1="16" x2="23" y2="16" stroke="#ffffff" stroke-width="0.6" opacity="0.35"/>
                    <line x1="17.5" y1="19" x2="23" y2="19" stroke="#ffffff" stroke-width="0.6" opacity="0.35"/>
                </svg>`;

                const blob = new Blob([svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
                if (link) {
                    link.href = url;
                }
            }

            document.addEventListener('DOMContentLoaded', function() {
                updateFavicon();
                const observer = new MutationObserver(updateFavicon);
                observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
            });
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
