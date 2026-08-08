const CACHE_NAME = "telecom-group-v5";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./admin.html",
    "./login.html",
    "./style.css",
    "./script.js",
    "./supabase.js",
    "./manifest.json"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())

    );

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if (key !== CACHE_NAME) {

                            return caches.delete(key);

                        }

                    })

                );

            })
            .then(() => self.clients.claim())

    );

});


self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(response => {

                return response || fetch(event.request);

            })

    );

});
