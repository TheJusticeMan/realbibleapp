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

let debugMode = false; // Default debug mode

// Listen for messages from the main thread
self.addEventListener("message", event => {
    if (event.data && event.data.type === "SET_DEBUG_MODE") {
        debugMode = event.data.debug; // Update debug mode
        console.log(`Debug mode is now ${debugMode ? "ON" : "OFF"}`);
    }
});

// Fetch event: Serve cached content when offline or force bypass cache
self.addEventListener("fetch", event => {
    if (debugMode) {
        console.log(`Debug mode is ON - Bypassing cache for: ${event.request.url}`);
        event.respondWith(
            fetch(event.request, { cache: "no-store" }).catch(() => {
                console.warn(`Fetch failed for ${event.request.url} - Unable to load resource in debug mode.`);
                return caches.match(event.request); // Fallback to cache if offline
            })
        );
    } else {
        console.log(`Debug mode is OFF - Serving cached content or fetching network for: ${event.request.url}`);
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
