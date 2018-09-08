let restaurant;
let reviews;
var map;


/**
  * Register the service worker
*/
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js').then(function(reg){
    //TODO: Any extra state-specific service worker functions later in the course
    if(reg.installing) {

    } else if(reg.waiting) {

    } else if(reg.active) {

    }
  });
}


/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  let smImg = DBHelper.smallImageUrlForRestaurant(restaurant) + " 400w";
  let medImg = DBHelper.mediumImageUrlForRestaurant(restaurant) + " 600w";
  let largeImg = DBHelper.largeImageUrlForRestaurant(restaurant) + " 800w";
  let imgSrcs = [ smImg, medImg, largeImg ].join(', ');

  image.className = 'detail-img lazyload'
  // image.src = DBHelper.imageUrlForRestaurant(restaurant);
  // image.sizes = '(max-width: 400px) 400px, (min-width: 401px) 600px, 800px';
  // image.srcset = imgSrcs;
  image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant) );
  image.setAttribute('data-sizes', '(max-width: 400px) 400px, (min-width: 401px) 600px, 800px' );
  image.setAttribute('data-srcset', imgSrcs);
  image.alt = restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML(restaurant.id);
  DBHelper.fetchReviewByRestaurantID(restaurant.id, fillReviewsHTML);
  //debugger;
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 * previously used reviews = self.restaurant.reviews as param
 */
fillReviewsHTML = (error, reviews) => {
  self.restaurant.reviews = reviews;

//  console.log('reviews?', reviews);
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  //debugger;
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'review-name';
  name.innerHTML = review.name;
  li.appendChild(name);

  let reviewDate = new Date(review.createdAt);
  let reviewFormatDate = reviewDate.toLocaleDateString();

  const date = document.createElement('p');
  date.className = 'review-date';
  //make a new Date to translate the createdAt data
  date.innerHTML = reviewFormatDate; //previously review.date in Stage 2
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.className = 'review-rating';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = 'review-comments';
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
