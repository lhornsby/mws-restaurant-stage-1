

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
  * Reviews Endpoint
  *
  */
  static get REVIEWS_URL() {
    const port = 1337
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  //Use Fetch instead of XHR
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL)
    .then(function(response) {
      if (!response.ok) {
        throw Error(response.status);
      }
      return response.json();
    }).then(function(data){
      const restaurants = data;
      //debugger;
      stuffData(restaurants);
      callback(null, restaurants);
    }).catch(err => {
        console.log("no fetch for you!");
        dbPromise.then(db => {
          const tx = db.transaction("restaurants", "readonly");
          const restaurantStore = tx.objectStore("restaurants");
          restaurantStore.getAll().then(restaurantsIdb => {
            callback(null, restaurantsIdb);
          });

      });
    });
  }

  /**
  * Fetch all reviews
  */
  static fetchReviews(callback) {
    fetch(DBHelper.REVIEWS_URL)
    .then(function(response) {
      if (!response.ok) {
        throw Error(response.status);
      }
      return response.json();
    }).then(function(data){
      const reviews = data;
    //  debugger;
      //Stuff data into IDB
      stuffReviewData(reviews);
      callback(null, reviews);
    }).catch(err => {
      console.log('no fetch for you!');
      dbPromise.then(db =>{
        const tx = db.transaction("reviews", "readonly");
        const reviewStore = tx.objectStore("reviews");
        reviewStore.getAll().then(reviewsIdb => {
          callback(null, reviewsIdb);
        });
      });
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
       //debugger;
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
  * Fetch a review by the Restaurant ID
  * endpoint is http://localhost:1337/reviews/?restaurant_id=1
  */
  static fetchReviewByRestaurantID(id, callback){
    DBHelper.fetchReviews((error, reviews) => {
      if (error) {
        callback(error, null);
      } else {
        //Find only the reviews that have the current restaurant id
        const review = reviews.filter( function(r) {
          if (r.restaurant_id == id) {
            return r;
          }
        });
        //debugger;
        //console.log('review???', review);
        if (review) {
          callback(null, review)
        } else {
          callback('No Review Found', null);
        }
      }
    });
  }
  /**
  * Fetch a review by the Review ID
  * not sure I'll need this just yet?
  */
  static fetchReviewByID(id, callback){

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
          //console.log('empty results');
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
  * Restaurant favorite call
  */
  static updateFav(id, favState) {
    const favURL = DBHelper.DATABASE_URL + `/${id}/?is_favorite=${favState}`;
    //PUT that URL up there at some point
    fetch(favURL, {method: 'PUT'})
    .then( () => {
      //access the restaurant store
      dbPromise.then(function(db){
        var tx = db.transaction('restaurants', 'readwrite');
        var restaurantStore = tx.objectStore('restaurants');
        //put new fav status based on restaurant id
        restaurantStore.get(id)
        .then( restaurant => {
          restaurant.is_favorite = favState;
          restaurantStore.put(restaurant);
        });
      });
    }).catch( err => {
      console.log('no favoriting');
    });
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
  store.createIndex('by-favs', 'is_favorite');

  var reviewStore = upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
  reviewStore.createIndex('by-restaurant', 'restaurant_id');

});
/* Stuff in some data */
function stuffData(restaurants) {
  dbPromise.then(function(db){
    var tx = db.transaction('restaurants', 'readwrite');
    var restaurantStore = tx.objectStore('restaurants');

    for (var restaurant in restaurants) {
      restaurantStore.put(restaurants[restaurant]);
    }
    return tx.complete;
  });
}
function stuffReviewData(reviews) {
  dbPromise.then(function(db){
    var tx = db.transaction('reviews', 'readwrite');
    var reviewStore = tx.objectStore('reviews');

    for (var review in reviews) {
      reviewStore.put(reviews[review]);
    }
    return tx.complete;
  });
}