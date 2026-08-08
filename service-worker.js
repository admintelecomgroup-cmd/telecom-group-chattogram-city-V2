"use strict";

// =======================================================
// Telecom Group Chattogram City
// service-worker.js
// =======================================================

const CACHE_NAME = "telecom-group-v5";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./supabase.js",
    "./manifest.json",

    // PWA Icons
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

// =======================================================
// Install
// =======================================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache => {

                return cache.addAll(FILES_TO_CACHE);

            })

            .then(() => {

                return self.skipWaiting();

            })

    );

});

// =======================================================
// Activate
// =======================================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

            .then(keys => {

                return Promise.all(

                    keys.map(key => {

                        if (key !== CACHE_NAME) {

                            return caches.delete(key);

                        }

                        return null;

                    })

                );

            })

            .then(() => {

                return self.clients.claim();

            })

    );

});

// =======================================================
// Fetch
// =======================================================

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)

            .then(response => {

                if (response) {

                    return response;

                }

                return fetch(event.request);

            })

    );

});
