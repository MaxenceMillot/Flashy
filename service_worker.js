const CACHE_NAME = "flashy-v1";

const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./js/app.js",
    "./js/state.js",
    "./js/decks.js",
    "./js/ui.js",
    "./js/scheduler.js",
    "./js/zoom.js",
    "./data/cards.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});