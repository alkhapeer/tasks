const VERSION = "hero-tasks-sw-v1";

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        self.clients.claim()
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request, {
            cache: "no-store"
        }).catch(() => {
            return fetch(event.request);
        })
    );
});