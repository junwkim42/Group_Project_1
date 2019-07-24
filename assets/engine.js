let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;
let infoList;
function initMap() {
  // Initialize variables
  bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  /* TODO: Step 4A3: Add a generic sidebar */
  infoPane = document.getElementById('rinfo');
  infoList = document.getElementById('rlist');

  // Try HTML5 geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 15
      });
      bounds.extend(pos);

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);

      // Call Places Nearby Search on user's location
      getNearbyPlaces(pos);
    }, () => {
      // Browser supports geolocation, but user has denied permission
      handleLocationError(true, infoWindow);
    });
  } else {
    // Browser doesn't support geolocation
    handleLocationError(false, infoWindow);
  }
}

// Handle a geolocation error
function handleLocationError(browserHasGeolocation, infoWindow) {

  pos = { lat: 43.6543, lng: -79.3860 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 15
  });

  // Display an InfoWindow at the map center
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Geolocation permissions denied. Using default location.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
  currentInfoWindow = infoWindow;

  // Call Places Nearby Search on the default location
  getNearbyPlaces(pos);
}

function getNearbyPlaces(position) {
    let request = {
      location: position,
      rankBy: google.maps.places.RankBy.DISTANCE,
      keyword: "(vegan) AND (cafe)"
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, nearbyCallback);
  }


  function nearbyCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMarkers(results);
      createListItem(results);
      console.log(results);
    }
  }
  
    // build list with Name Rating address
    function createListItem(places){
        while (infoList.lastChild) {
            infoList.removeChild(infoList.lastChild);
        }
        places.forEach(place => {
            let item = document.createElement('li');
            let name = document.createElement('div');
            let rate = document.createElement('div');
            let address = document.createElement('div');
            let price = "";

            for (var i = 0; i < place.price_level; i++){
                price += "$";
            }
    
            
            if (price != ""){
                rate.textContent = `${place.rating} \u272e | ${price}`
            }
            else{
                rate.textContent = `${place.rating} \u272e`
            }
            name.textContent = place.name;
            address.textContent = place.vicinity;
    
            item.appendChild(name);
            item.appendChild(rate);
            item.appendChild(address);
            infoList.appendChild(item);
        });
      }

  
  function createMarkers(places) {
    places.forEach(place => {
      let marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name
      });

      /* TODO: Step 4B: Add click listeners to the markers */
      // Add click listener to each marker
      google.maps.event.addListener(marker, 'click', () => {
        let request = {
          placeId: place.place_id,
          fields: ['name', 'formatted_address', 'geometry', 'rating',
            'website', 'photos', 'review']
        };

        /* Only fetch the details of a place when the user clicks on a marker.
         * If we fetch the details for all place results as soon as we get
         * the search response, we will hit API rate limits. */
        service.getDetails(request, (placeResult, status) => {
          showDetails(placeResult, marker, status)
        });
      });

      // Adjust the map bounds to include the location of this marker
      bounds.extend(place.geometry.location);
    });
    /* Once all the markers have been placed, adjust the bounds of the map to
     * show all the markers within the visible area. */
    map.fitBounds(bounds);
  }
  
  function showDetails(placeResult, marker, status) {
      console.log(placeResult);
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      let placeInfowindow = new google.maps.InfoWindow();
      let rating = "None";
      if (placeResult.rating) rating = placeResult.rating;
      placeInfowindow.setContent('<div><strong>' + placeResult.name +
        '</strong><br>' + 'Rating: ' + rating + '</div>');
      placeInfowindow.open(marker.map, marker);
      currentInfoWindow.close();
      currentInfoWindow = placeInfowindow;
      showPanel(placeResult);
    } else {
      console.log('showDetails failed: ' + status);
    }
  }



  // details are name pricture website and review
  function showPanel(placeResult) {
    // If infoPane is already open, close it

    while (infoPane.lastChild) {
        infoPane.removeChild(infoPane.lastChild);
      }

    // Clear the previous details

    /* TODO: Step 4E: Display a Place Photo with the Place Details */
    // Add the primary photo, if there is one
    if (placeResult.photos) {
      let firstPhoto = placeResult.photos[0];
      let photo = document.createElement('img');
      photo.classList.add('hero');
      photo.style.width = "200px";
      photo.style.height = "300px";
      photo.src = firstPhoto.getUrl();
      infoPane.appendChild(photo);
    }

    // Add place details with text formatting
    let name = document.createElement('h1');
    name.classList.add('place');
    name.textContent = placeResult.name;
    infoPane.appendChild(name);
    if (placeResult.rating) {
      let rating = document.createElement('p');
      rating.classList.add('details');
      rating.textContent = `Rating: ${placeResult.rating} \u272e`;
      infoPane.appendChild(rating);
    }
    let address = document.createElement('p');
    address.classList.add('details');
    address.textContent = placeResult.formatted_address;
    infoPane.appendChild(address);
    if (placeResult.website) {
      let websitePara = document.createElement('p');
      let websiteLink = document.createElement('a');
      let websiteUrl = document.createTextNode(placeResult.website);
      websiteLink.appendChild(websiteUrl);
      websiteLink.title = placeResult.website;
      websiteLink.href = placeResult.website;
      websitePara.appendChild(websiteLink);
      infoPane.appendChild(websitePara);
    }
    /*
    for (var i = 0; i < placeResult.reviews.length ; i++){

    }
    */
   placeResult.reviews.forEach(review => {
        let rdetail = document.createElement('div');
        let author = document.createElement('p');
        let rateNtime = document.createElement('p');
        let user_text = document.createElement('p');
        let user_rating = "";
        let time = review.relative_time_description;

        for(var i = 0; i < review.rating ; i++){
            user_rating += "\u272e";
        }
        author.textContent = review.author_name;
        rateNtime.textContent = user_rating + "     ||      " + time;
        user_text.textContent = review.text;

        rdetail.appendChild(author);
        rdetail.appendChild(rateNtime);
        rdetail.appendChild(user_text);

        infoPane.appendChild(rdetail);

   });
  }

  // present basic map or get user location without consent
  // when search button clicked add value to keyword line 71
  // grab store id from line 82
  // build list with Name Rating address
  // detailed info of restaurant WHEN MARKER CLICKED
  // get info with "place detail request" using store id
  // details are name pricture website and review
  // need reviews only from the place detail. other info can be grabbed from line 82

  // When diretion comes add it under click