let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []


/**
  * Register the service worker
*/
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js').then(function(reg){
    //TODO: Any extra state-specific service worker functions later in the course
    if(reg.installing) {
    //  console.log('sw regist', self);
    } else if(reg.waiting) {
    //  console.log('sw waiting', self);
    } else if(reg.active) {
    //  console.log('sw active', self);
    }
  });
}


/**
* Toggle filter bar on mobile size
* if the max width is 600px, add .collapsed; add aria-hidden labels, remove class
*/
var filterElem = document.querySelector('#filter-bar');
var filterGroup = filterElem.getElementsByClassName('filter-group');
var mediaQueryFilter = window.matchMedia('(max-width: 600px)');

function filterAria(currentClass){
  for (var i = 0;  i < filterGroup.length; i++) {
    if (currentClass.includes('collapsed') && mediaQueryFilter.matches) {
      filterGroup[i].setAttribute('aria-hidden', 'true');
    } else {
      filterGroup[i].setAttribute('aria-hidden', 'false');
    }
  }
}

function mobileFilter(media) {
  if (media.matches) {
    filterElem.className = "filter-options collapsed";
  } else {
    filterElem.className = "filter-options";
    filterAria(filterElem.classList.value);
  }
}

//Open the filter when someone clicks the header
function toggleFilterClass() {
  filterElem.classList.toggle('collapsed');
  filterAria(filterElem.classList.value);
}
var filterHeader = document.querySelector('.filter-header');


window.addEventListener("load", function(e){
  mediaQueryFilter.addListener(mobileFilter);
  filterHeader.addEventListener('click', toggleFilterClass);
  filterAria(filterElem.classList.value);
});

var observerTarget;
//Try Intersection Observer api, separate it out from other Load listener
window.addEventListener("load", function(event) {
  observerTarget = document.querySelector('#map');
  observerMap();
}, false);

function observerMap() {
  var observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0
  }
  var observer = new IntersectionObserver(handleMap, observerOptions);
  observer.observe(observerTarget);
}
//Check how close we are to the map based on IntersectionObserver entries
function handleMap(entries, observer) {
  for (entry of entries) {
    if (entry.isIntersecting) {
      //check if we're offline here for initializing map
      if (navigator.onLine) {
        loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyCUsOidHgLJfN1lyG_NiuVACWAkaPX_gt8&libraries=places&callback=initMap');
        observer.unobserve(observerTarget);
      } else {
        //serve image a background images if we're offline and can't get map API
        initMap();
      }
    } else {
      updateRestaurants();
    }
  }
}
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  if (navigator.onLine) {
    let loc = {
      lat: 40.722216,
      lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      scrollwheel: false
    });
  } else {
    //shove in a static image file of the map if we're offline
    document.getElementById('map').style.backgroundImage = 'url(./img/static-map-orig-compressor.png)';
  }
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  //Remove 'No Results for current filter' message
  const noResultsMsg = document.getElementById('no-results-message');
  noResultsMsg.innerHTML = '';
  noResultsMsg.setAttribute('aria-hidden', 'true');

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  let smImg = DBHelper.smallImageUrlForRestaurant(restaurant) + " 400w";
  //let medImg = DBHelper.mediumImageUrlForRestaurant(restaurant) + " 600w";
  let imgSrcs = [ smImg ].join(', ');

  image.className = 'restaurant-img lazyload';
//  image.src = DBHelper.imageUrlForRestaurant(restaurant);
//  image.sizes = '(max-width: 400px) 400px, (min-width: 401px) 600px'
//  image.srcset = imgSrcs;
  image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant) );
  image.setAttribute('data-sizes', '(max-width: 400px) 400px, (min-width: 401px) 600px' );
  image.setAttribute('data-srcset', imgSrcs);
  image.alt = restaurant.name;
  li.append(image);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('span');
  const neighborhoodAriaLabel = 'Neighborhood: '+ restaurant.neighborhood;
  neighborhood.className = 'restaurant-neighborhood';
  neighborhood.setAttribute('aria-label', neighborhoodAriaLabel);
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  const moreAriaLabel = 'View Details About ' + restaurant.name;
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', moreAriaLabel);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

