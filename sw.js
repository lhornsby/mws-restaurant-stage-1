var mainCacheName = 'restaurant-cache-v5';
var imgsCache = 'restaurant-imgs';
var allCaches = [
  mainCacheName,
  imgsCache
];

self.addEventListener('install', function(event) {
  //At install find assets and add to the cache
  event.waitUntil(
    caches.open(mainCacheName).then(function(cache) {
      cache.addAll(
        //List of files
        [
          'css/styles.css',
          'js/vendors.min.js',
          'js/dbhelper.js',
          'js/loadJS.js',
          'js/main.js',
          'js/restaurant_info.js',
          'index.html',
          'restaurant.html',
          'img/static-map-orig-compressor.png'
        ]
      );
    })
  );
});

self.addEventListener('activate', function(event){
  console.log('activated!!!');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-') && !allCaches.includes(cacheName);
        }).map(function(cacheName){
          return caches.delete(cacheName);
        })
      )
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  //console.log(event.request);
  if (requestUrl.origin === location.origin ) {
    if(requestUrl.pathname === '/') {
      event.respondWith(caches.match('index.html'));
      return;
    }
    //For single restaurant, there's a query param with `search`
    if(requestUrl.search) {
      event.respondWith(caches.match('restaurant.html'));
      return;
    }
    //For images
    if(requestUrl.pathname.startsWith('/images_sized/')) {
      //get image from the Image cache instead if the request has our image path
      event.respondWith(getPhoto(event.request));
      return;
    }
  }//end local origin requests


  if (requestUrl.pathname === '/restaurants') {
     // console.log('restaurant url!', requestUrl);
     // return;
  }
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );

});

function getPhoto(request) {
  var imgUrl = request.url;

  return caches.open(imgsCache).then(function(cache){
    return cache.match(imgUrl).then(function(response){
      if (response) return response;

      return fetch(request).then(function(networkResp){
        cache.put(imgUrl, networkResp.clone());
        return networkResp;
      });
    });
  });
}