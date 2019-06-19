const preCacheName = "test-cache-v2"

// pre-cache
self.oninstall = event => {
    console.log("oninstall")

    event.waitUntil(
        caches.open(preCacheName).then(cache => {
            cache.addAll([
                "/",
                "/style.css",
                "/index.html",
                "/app.js",
                "/manifest.json"
            ])
        })
    )

    self.skipWaiting()
}

// Deal with old caches
self.onactivate = event => {
    console.log("onactivate")

    event.waitUntil(
        caches.keys().then(cacheNames => {
            const deletes = cacheNames.map(cacheName => {
                if(cacheName !== preCacheName) {
                    return caches.delete(cacheName)
                }

                return Promise.resolve()
            })

            return Promise.all(deletes)
        })
    )

    self.clients.claim()
}

self.onfetch = event => {
    console.log(`Fetch: ${event.request.method} ${event.request.url}`)

    const url = new URL(event.request.url)

    console.log(url.origin)
    if(url.origin === "https://retro-shooter-am4l-v2.firebaseapp.com") {
        event.respondWith(networkFirst(event.request))
    }
    else {
        event.respondWith(cacheFirst(event.request))
    }
}

const cacheFirst = (request) => {
    return caches.match(request).then(response => {
        if(response) {
            console.log(`Cache Hit for ${request.url}`)
            return response
        }

        return fetch(request)
    })
}

const networkFirst = request => {
    console.log("network-first")
    return caches.open("retro-shooter-dynamic").then(cache => {
        return fetch(request)
        .then(networkResponse => {
            if(request.method === "GET") {
                cache.put(request, networkResponse.clone())
            }
            return networkResponse
        })
        .catch(() => {
            return cache.match(request)
        })
    })
}
