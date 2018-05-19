
self.addEventListener('install', function(event) {
  console.log('hello i installed');
  //At install find assets and add to the cache
  event.waitUntil(
    caches.open('restaurant-cache').then(function(cache) {
      cache.addAll(
        //list of files
        [
          '/css/styles.css',
          '/data/restaurants.json',
          '/js/dbhelper.js',
          '/js/main.js',
          '/js/restaurant_info.js',
        ]
      );
    })
  );
});

self.addEventListener('activate', function(event){

});
