//Reference from the lesson
// idb.open('test-db', 5, (upgradeDb) => {
//   const keyValStore = upgradeDb.createObjectStore('keyval');
//   keyValStore.put("world", "hello");
//   keyValStore.put("da fuk", "what");
//   keyValStore.put("something", "do");
//   return;
// });

//get to global restaurant array?
// console.log(restaurants);


const dbPromise = idb.open('restaurant-db', 3, (upgradeDb) => {
  switch(upgradeDb.oldVersion){
    case 0:
      const keyValStore = upgradeDb.createObjectStore('keyval');
      keyValStore.put("world", "hello");
    case 1:
      upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
  }
  //return;
});

dbPromise.then(function(db){
  //make transactions first then put in objects
  var tx = db.transaction('restaurants', 'readwrite');
  var restaurantStore = tx.objectStore('restaurants');



  restaurantStore.put({
    id: 1,
    name: 'LeBlanc',
    address:"171 E Broadway, New York, NY 10002",
    cuisine_type:"Asian"

  });
  return tx.complete;
});