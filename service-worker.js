"use strict";

/* ==========================================
   Telecom Group Chattogram City
   Production Service Worker
========================================== */

const CACHE_NAME = "telecom-group-v3";

const FILES = [
    "./",
    "./index.html",
    "./login.html",
    "./admin.html",

    "./style.css",
    "./login.css",

    "./script.js",
    "./login.js",
    "./supabase.js",

    "./manifest.json",

    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

/* ==========================================
   Install
========================================== */

self.addEventListener("install", (event) => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME).then((cache) =>

            Promise.allSettled(
                FILES.map(file => cache.add(file))
            )

        )

    );

});

/* ==========================================
   Activate
========================================== */

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys().then((keys) =>

            Promise.all(

                keys.map((key) => {

                    if (key !== CACHE_NAME) {

                        return caches.delete(key);

                    }

                })

            )

        )

    );

    self.clients.claim();

});

/* ==========================================
   Fetch
========================================== */

self.addEventListener("fetch", (event) => {

    if (event.request.method !== "GET") return;

    if (!event.request.url.startsWith("http")) return;

    event.respondWith(

        caches.match(event.request).then((cachedResponse) => {

            const networkFetch = fetch(event.request)

                .then((networkResponse) => {

                    if (
                        networkResponse &&
                        networkResponse.status === 200
                    ) {

                        const responseClone = networkResponse.clone();

                        caches.open(CACHE_NAME).then((cache) => {

                            cache.put(event.request, responseClone);

                        });

                    }

                    return networkResponse;

                })

                .catch(() => cachedResponse);

            return cachedResponse || networkFetch;

        }).catch(() => {

            if (
                event.request.destination === "document"
            ) {

                return caches.match("./index.html");

            }

        })

    );

});