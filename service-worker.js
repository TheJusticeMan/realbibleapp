const VERSION = "4.01.11";
const CACHE_NAME = `bible-app-cache-V${VERSION}`;
const ASSETS = [
    "./index.html",
    "./manifest.json",
    "./index_files/BibleCount.json",
    "./index_files/cross_references.json",
    "./index_files/Bibles/KJV.json",
    "./index_files/fromthepages_64x64.jpg",
    "./OpenBible.svg",
    "./icon-192.png",
    "./icon-512.png",
    "./screenshot1.png",
    "./screenshot2.png",
    "./Share.svg",
    "./index_files/cleanstyle.css",
    "./index_files/WebSetup.js",
    "./index_files/Search.js",
    "./index_files/ShowFuncs.js",
    "./index_files/functions.js",
    "./index_files/domHandlers.js",
    "./index_files/History.js",
    "./index_files/bookmarks.js",
    "./index_files/topics.js",
    "./index_files/topic-scores.txt",
    "./index_files/Settings.js",
    "./index_files/main.js"
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

const skipCache=true;

// Fetch event: Serve cached content when offline or force bypass cache
self.addEventListener("fetch", event => {
    if (event.request.url.endsWith("/version")) {
        console.log('Version request intercepted');
        event.respondWith(
            new Response(VERSION, { status: 200, headers: { "Content-Type": "text/plain" } })
        );
    } else {
        if (skipCache) {
            console.log('Skipping cache for:', event.request.url);
            event.respondWith(fetch(event.request));
            return;
        }
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
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
