const CACHE_NAME = "bible-app-cache-v1.01.05";
const ASSETS = [
    "/", // Cache the root URL
    "/index.html",
    "./index_files/manifest.json",
    "./index_files/BibleCount.json",
    "./index_files/BibleCRef.json",
    "./index_files/bible.json",
    "./index_files/fromthepages_64x64.jpg",
    "./OpenBible.svg",
    "./index_files/cleanstyle.css",
    "./index_files/hammer.min.js",
    "./index_files/WebSetup.js",
    "./index_files/Bible.js",
    "./index_files/Search.js",
    "./index_files/ShowFuncs.js",
    "./index_files/functions.js",
    "./index_files/domHandlers.js",
    "./index_files/History.js",
    "./index_files/bookmarks.js",
    "./index_files/main.js",
];

// Install event: Cache files
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Opened cache");
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting(); // Immediately activate the new service worker
});

// Fetch event: Serve cached content when offline
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Return cached file or fetch it from the network
            return response || fetch(event.request);
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Immediately control all clients
});
