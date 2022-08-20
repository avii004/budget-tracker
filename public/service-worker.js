const APP_PREFIX = 'Budget-'
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  "./index.html",
  "./css/styles.css",
  "./js/idb.js",
  "./js/index.js",
  "./manifest.json"
];


self.addEventListener('fetch', function (event) {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(CACHE_NAME)
      .then(cache => {
        return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            
            return response;
          })
          .catch(err => {

            return cache.match(event.request);
          })
      })
      .catch(err => console.log(err))
    );

    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  )
});


self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(FILES_TO_CACHE)
    })
  )
})


self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {

      let cacheKeepList = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      
      cacheKeepList.push(CACHE_NAME);

      return Promise.all(keyList.map(function (key, i) {
        if (cacheKeepList.indexOf(key) === -1) {
          return caches.delete(keyList[i])
        }
      }));
    })
  )
});