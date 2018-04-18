// Install stage sets up the index page (home page) in the cahche and opens a new cache
self.addEventListener('install', function (event) {
  var indexPage = new Request('index.html');
  event.waitUntil(
    fetch(indexPage).then(function (response) {
      return caches.open('pwabuilder-offline').then(function (cache) {
        console.log('[Service Worker] Cached index page during Install' + response.url);
        return cache.put(indexPage, response);
      });
    }));
});

// Return cached requests, if navigator is offline and request is found in cache.
// Otherwise make a request to server and cache it.
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (resp) {
      if(!navigator.onLine && resp) {
        return resp;
      }
      return fetch(event.request).then(function (response) {
        return caches.open('pwabuilder-offline').then(function (cache) {
          if (event.request.method === "GET") {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});

// Listen for push notifications.
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Hunt for notifications';
  const options = {
    body: event.data.text(),
    icon: 'apple-icon.png',
    badge: 'apple-icon.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://huntforglory.herokuapp.com/')
  );
});