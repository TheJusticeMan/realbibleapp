const CACHE_NAME = "bible-app-cache-v3.00.01";
const ASSETS = [
    "/realbibleapp/index.html", // Explicit root page
    "/realbibleapp/manifest.json",
    "/realbibleapp/index_files/BibleCount.json",
    "/realbibleapp/index_files/BibleCRef.json",
    "/realbibleapp/index_files/Bible.json",
    "/realbibleapp/index_files/fromthepages_64x64.jpg",
    "/realbibleapp/OpenBible.svg",
    "/realbibleapp/icon-192.svg",
    "/realbibleapp/icon-512.svg",
    "/realbibleapp/screenshot1.svg",
    "/realbibleapp/screenshot2.svg",
    "/realbibleapp/Share.svg",
    "/realbibleapp/index_files/cleanstyle.css",
    "/realbibleapp/index_files/WebSetup.js",
    "/realbibleapp/index_files/Search.js",
    "/realbibleapp/index_files/ShowFuncs.js",
    "/realbibleapp/index_files/functions.js",
    "/realbibleapp/index_files/domHandlers.js",
    "/realbibleapp/index_files/History.js",
    "/realbibleapp/index_files/bookmarks.js",
    "/realbibleapp/index_files/topics.js",
    "/realbibleapp/index_files/topic-scores.txt",
    "/realbibleapp/index_files/Settings.js",
    "/realbibleapp/index_files/main.js"
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
