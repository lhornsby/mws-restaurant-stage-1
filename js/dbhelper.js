

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Previously was using the JSON file in data/ folder for Stage 1
   */
  static get DATABASE_URL() {
    const port = 1337 // server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  //Use Fetch instead of XHR
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
    .then(function(response) {
      return response.json();
    }).then(function(data){
      const restaurants = data;
      callback(null, restaurants);
    }).catch(function(){
      const error = `Request failed :(`;

      //TODO: if the request fails, do some error thing besides a console log?

      callback(error, null);
    });
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
      //  debugger;
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
        //Error message in case there's no matching filterable results
        if (results === undefined || results.length === 0) {
          console.log('empty results');
          const message = document.getElementById('no-results-message');
          message.innerHTML = 'No results for current filter.';
          message.setAttribute('aria-hidden', 'false');
        }
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Restaurant resized image URLs.
   */
 static largeImageUrlForRestaurant(restaurant) {
   //Photos are named based on Restaurant IDs so use that to find the different sized images
   let photoRef = restaurant.id;
   return (`/images_sized/${photoRef}-large.jpg`);
 }
  static mediumImageUrlForRestaurant(restaurant) {
    let photoRef = restaurant.id;
    return (`/images_sized/${photoRef}-medium.jpg`);
  }
  static smallImageUrlForRestaurant(restaurant) {
    let photoRef = restaurant.id;
    return (`/images_sized/${photoRef}-small.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}

/* Setup IDB */
const dbPromise = idb.open('restaurant-db', 1, (upgradeDb) => {

  var store = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
  store.createIndex('by-name', 'name');
  store.createIndex('by-image', 'photograph');

});
/* Stuff in some data */
dbPromise.then(function(db){
  DBHelper.fetchRestaurants((error, restaurants) => {
    if (error) {
      callback(error, null);
    } else {
      //make transactions first then put in objects
      var tx = db.transaction('restaurants', 'readwrite');
      var restaurantStore = tx.objectStore('restaurants');

      for (var restaurant in restaurants) {
        restaurantStore.put(restaurants[restaurant]);
      }

      return tx.complete;

    }
  });

});
