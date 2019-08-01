
// addEventLister('sbutton') : When 'sbutton' clicked, remove all Markers, Directions and restaurant list and info if they were already existing.
//                             Retrieve searchterm from searchbar. 
//                             Remove 'vegan' from searchterm. Vegan will be added in a format demanded by Google Map Places API.
//                             Call getNearbyPlaces() with coordinates (pos) saved from initMap() and formatted searchterm 
document.getElementById('sbutton').addEventListener("click", function(event){
    event.preventDefault();
    if(allMarkers.length != 0){
        deleteMarkers();
    }
    if (allEvents.length > 0){
      allEvents[0].directionsDisplay.setMap(null);
    }
    clearExsiting();

    searchterm = document.getElementById('searchbar').value.replace(/vegan/g, '').trim();
    if (searchterm == ""){
        searchterm = 'vegan';
    }
    else{
        searchterm = "(vegan) AND " + `(${searchterm})`
    }
    console.log(searchterm);

    getNearbyPlaces(pos, searchterm);
});

// deleteMarkers() : remove existing markers from the map and set allMarkers[] to empty array.
function deleteMarkers() {
    for (var i = 0; i < allMarkers.length; i++) {
        allMarkers[i].setMap(null);
    }
    allMarkers = [];
}


// handleLocationError() : Handle a geolocation error
//                         browserHasGeolocation is true = user browser supports geolocation but user didnt agree on consent to use his/her current location
//                         browserHasGeolocation is false = user browser does not support geolocation.
//                         In either case, open map with default coordinates (toronto downtown)  
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

}
// getNearbyPlaces() : make place request to Google Map Places API
//                     request consists of position (current position or default), order by closest distance 
//                     and with keyword from 'sbutton' eventListner (vegan + user input)
//                     Call service.nearbySearch() and pass the response and nearbyCallback() 
function getNearbyPlaces(position, key) {
    let request = {
      location: position,
      rankBy: google.maps.places.RankBy.DISTANCE,
      keyword: key
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, nearbyCallback);
  }

//nearbyCallback() : results and status passed from nearbySearch call.
//                   if Google Map Places API returned valid status, 
//                    call createMarkers() and pass results obtained from request
//                    call creatListItem() and pass the results obtained from request
  function nearbyCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMarkers(results);
      createListItem(results);
      console.log(results);
    }
  }
  
    // createListItem() : build restaurant list with Name Rating address pulled out from data obtained with getNearbyPlaces
    function createListItem(places){
        while (infoList.lastChild) {
            infoList.removeChild(infoList.lastChild);
        }
        infoList.style.backgroundColor = "#f29900";
        places.forEach(place => {
            let item = document.createElement('li');
            let name = document.createElement('div');
            let rate = document.createElement('div');
            let address = document.createElement('div');
            let dline = document.createElement('HR');
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
            name.style.fontWeight = "bold";
            address.textContent = place.vicinity;
            dline.style.backgroundColor = "white";
            dline.style.height = "3px";
            dline.style.width = "80%";
            dline.style.marginLeft = "0px";
            item.appendChild(name);
            item.appendChild(rate);
            item.appendChild(address);
            infoList.appendChild(item);
            if(place != places[19]){
              infoList.appendChild(dline);
            }
        });

        // for each restaurant list item, set trigger such that clicking on the list item is equivalent to clicking Markers associated with that restaurant 
        let tags = document.getElementsByTagName('li');
        for (var i=0;i<tags.length;i++){
            tags[i].addEventListener('click', function(){
                for(var i = 0; i < allMarkers.length; i++){
                    if(allMarkers[i].title == this.children[0].textContent){
                        console.log("restaurant : " + this.children[0].textContent);
                        google.maps.event.trigger(allMarkers[i], 'click');
                    }
                }
            });
        }
      }

//createMarkers() : createMarkers with data from getNearbyPlaces and push each marker to allMarkers[]
//                  add click event listener to each marker
//                  when marker is clicked, it will request details of the place through Google Map Places API
//                  it will also make a call to Google Map Directions service to draw directions to that restaurant from current location
//                  From previous weatherAPI call, if weatherStatus is set to one of rain, storm, drizzle, snow, make directions request with
//                  keyword 'TRANSIT' which will display the direction in public transit route
//                  else make Directions request using 'WALKING'
  function createMarkers(places) {
    places.forEach(place => {
      let marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        title: place.name
      });
      allMarkers.push(marker);

      // Add click listener to each marker
      google.maps.event.addListener(marker, 'click', () => {
        console.log(marker);
        let tmode = 'WALKING';
        let request = {
          placeId: place.place_id,
          fields: ['name', 'formatted_address', 'geometry', 'rating',
            'website', 'photos', 'review', 'opening_hours']
        };

        if (allEvents.length > 0){
          allEvents[0].directionsDisplay.setMap(null);
        }
        //weatherStatus = "thunderstorm";
        if (weatherStatus.includes("drizzle") || weatherStatus.includes("rain") || weatherStatus.includes("storm") || weatherStatus.includes("snow")){
          tmode = 'TRANSIT';
        }
        else{
          tmode = 'WALKING';
        }
        var me = this;
        allEvents.push(me);
        console.log(me);
        this.directionsService = new google.maps.DirectionsService;
        this.directionsDisplay = new google.maps.DirectionsRenderer;
        this.directionsDisplay.setMap(map);
        this.directionsService.route({
          origin: pos,
          destination: marker.position,
          travelMode: tmode
        }, function(response, status) {
          if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
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
  
  // showDetails(): Display restaurant's name and rating on a small pop-up that appears when user clicks on a marker
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



  
  // showPanel(): Display restaurant picture, name, rating, open status and daily hours.
  //              styles are added upon element creation.
  function showPanel(placeResult) {
    // If infoPane is already open, close it
    clearExsiting();
    // Clear the previous details
    infoPane.style.backgroundColor = "#f29900";
    if (placeResult.photos) {
      let firstPhoto = placeResult.photos[0];
      let photo = document.createElement('img');
      photo.classList.add('hero');
      photo.style.width = "100%";
      photo.style.height = "250px";
      photo.style.borderRadius = "25px";
      photo.style.alignSelf = "center";
      photo.src = firstPhoto.getUrl();
      infoPane.appendChild(photo);
    }

    //calculate current day of week 
    var d = new Date();
    var n = d.getDay();
    console.log("current day : " + n);
    //getDay counts Sunday as 0 and Saturday as 6, whereas Google Map Places Details counts Monday as 0 and Sunday as 6
    // subtracting 1 is necessary to grab current day's operating hours from the API
    n = n - 1;
    if (n < 0){
      n = 6;
    }
    // Add place details with text formatting
    let name = document.createElement('p');
    let isOpen = document.createElement('p');
    let hours = document.createElement('p');
    name.classList.add('place');
    name.textContent = placeResult.name;
    
    if (placeResult.rating) {
      name.textContent += ` \u272e${placeResult.rating}`;
    }
    if (placeResult.opening_hours.open_now){
      isOpen.textContent = "Open";
      isOpen.style.color = "#2FC80D";
    }
    else {
      isOpen.textContent = "Closed at this moment";
      isOpen.style.color = "red";
    }
    isOpen.style.fontWeight = "bold";
    isOpen.classList.add('details');
    hours.classList.add('details');
    hours.textContent = placeResult.opening_hours.weekday_text[n];

    infoPane.appendChild(name);
    infoPane.appendChild(isOpen);
    infoPane.appendChild(hours);
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
// create a list of 5 reviews in the 'reviewbox' html element
    document.getElementById('reviewbox').style.backgroundColor = "#2FC80D";
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
        author.style.marginTop = "8px";
        author.style.fontWeight = "bold";
        author.style.fontSize = "15px";
        rateNtime.textContent = user_rating + "     ||      " + time;
        rateNtime.style.marginBottom = "0px";
        user_text.textContent = review.text;
        user_text.style.marginTop = "0px";
        rdetail.appendChild(author);
        rdetail.appendChild(rateNtime);
        rdetail.appendChild(user_text);

        reviewList.appendChild(rdetail);

   });
  }

// clearExisting(): remove existing information from restauraunt detail and reviewlist and set background color to transparent.
function clearExsiting(){
  while (infoPane.lastChild) {
    infoPane.removeChild(infoPane.lastChild);
  }
  infoPane.style.backgroundColor = "transparent";
  while (reviewList.lastChild) {
    reviewList.removeChild(reviewList.lastChild);
  }
  document.getElementById('reviewbox').style.backgroundColor = "transparent";
}
