// service-worker.js
const CACHE_NAME = 'kindergarten-app-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/js/main.js',
    '/js/data.js',
    '/js/fileHandler.js',
    '/js/ui.js',
    '/js/utils.js',
    '/js/lib/sortable.esm.js',
    '/css/styles.css',
    '/lib/sortable.esm.js',
    '/lib/sweetalert2@11.js',
    '/lib/tailwindcss.js',
    '/pwd.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Failed to cache resources:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});