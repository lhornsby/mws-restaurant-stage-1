self.addEventListener('install', function(event) {
  //At install find assets and add to the cache
  event.waitUntil(
    caches.open('restaurant-cache').then(function(cache) {
      cache.addAll(
        //List of files
        [
          'css/styles.css',
          'js/dbhelper.js',
          'js/main.js',
          'js/restaurant_info.js',
          'index.html',
          'restaurant.html'
        ]
      );
    })
  );
});

self.addEventListener('activate', function(event){
  console.log('activated!');
});

self.addEventListener('fetch', function(event) {

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        //Make a copy of the request since it can only be consumed once
        //and we're doing both a fetch and caching
        let cloneRequest = event.request.clone();

        return fetch(cloneRequest).then(function(response) {
          //Check if response is valid and aren't from 3rd party assets
          if (response.status !== 200  || !response || response.type !== 'basic') {
            return response;
          }

          //Clone again but the Response instead
          let cloneResponse = response.clone();
          caches.open('restaurant-cache')
          .then(function(cache){
            cache.put(event.request, cloneResponse);
          });

        });
    })
  );

});