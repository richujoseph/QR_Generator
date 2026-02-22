// Service Worker for QR Code Generator PWA
const CACHE_NAME = 'qr-generator-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/css/variables.css',
    '/css/reset.css',
    '/css/layout.css',
    '/css/components/card.css',
    '/css/components/forms.css',
    '/css/components/buttons.css',
    '/css/components/qr-display.css',
    '/css/components/toast.css',
    '/css/components/history.css',
    '/css/components/features.css',
    '/css/components/scanner.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/config.js',
    '/js/validators.js',
    '/js/toast.js',
    '/js/qr-engine.js',
    '/js/history.js',
    '/js/history-ui.js',
    '/js/qr-data-encoder.js',
    '/js/smart-paste.js',
    '/js/qr-scanner.js',
    '/js/templates.js',
    '/js/i18n.js',
    '/js/logo-embed.js',
    '/js/branded-frame.js',
];

// Install — cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch — serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET and CDN requests
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('cdn.jsdelivr.net') || event.request.url.includes('fonts.googleapis.com')) {
        // Network-first for CDN resources
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for local assets
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});
