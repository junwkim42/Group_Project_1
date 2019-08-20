//--------- Variables -----------
// APIKey : api key for Google Map API
// WeatherStatus : string variable containing weather status such as "rain", "thunderstorm", "clear sky"
//                 as provided by returning response from weather API
// response : Response from weather api is saved here to be used in buildicon function
// pos : Coordinate (lat,lng) object of cureent location received from initmap() (Google map api). If user refuses to provide location, default is set to toronto Downtown coordinate.
// map : map object used for functions involved with Google map api. Initialized in initMap();
// bounds : bound for map. Initialized in initmap(). Modified in createMarkers (engine.js) to include all 20 markers returned from G Map API
// infoWindow, currentInfoWindow : small window which appears when clicking on a location in the map. Displays place name and rating. 
// service : google maps Places service
// infoPane : initialized to <div id=rinfo> in html. Restaurant information such as picture name rating, hours, currently open are obtained from Google places API and displayed in the html.
// reviewList: initialized to <div id=reviewlist> in html. Five restaurant reviews are pulled from Google Map Places API and displayed.
// infoList: initialized to <div id=rlist> in html. List of 20 restaurants around user's current location displayed.
// searchterm : search keyword input from user. Fetched from 'searchbar' when 'sbutton' is clicked.
// allMarkers: array that stores all 20 markers of each restaurant. When the user makes a new search, old markers will be referenced through this array to be removed from the map.
// allEvents: array that stores direction event from Google Maps Directions API. When the user clicks on a new marker, blue path(direction) line from current location to old marker gets referenced through this array to be removed from the map.
var APIKey = "Your key";
var weatherStatus;
var response;
var iconCode;
var iconURL;
let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;
let reviewList;
let infoList;
let searchterm;
let allMarkers = [];
let allEvents = [];

var queryURL = "https://api.openweathermap.org/data/2.5/weather?";

//initMap() : initialize variables necessary for using map.
//            Save current coordinate of the user upon user agreement. 
//            Else default location is set to Toronto Downtown { lat: 43.6543, lng: -79.3860 }; in handlelocationError() (engine.js) 
//            Calls queryCall() after receiving coordinates. (regardless of user consent on using current geolocation)
function initMap() {
    // Initialize variables
    bounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow;
    currentInfoWindow = infoWindow;
    infoPane = document.getElementById('rinfo');
    reviewList = document.getElementById('reviewlist');
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
        new google.maps.Marker({position: pos, map: map});
        infoWindow.setPosition(pos);
        infoWindow.setContent('Location found.');
        infoWindow.open(map);
        map.setCenter(pos);
        var lati = pos.lat.toFixed(4);
        var longi = pos.lng.toFixed(4);
        queryURL = queryURL + `lat=${lati}` + `&lon=${longi}` +  `&units=metric&appid=` + APIKey;
        queryCall();
  
      }, () => {
        // Browser supports geolocation, but user has denied permission
        handleLocationError(true, infoWindow);
        queryURL = queryURL + `lat=${pos.lat}` + `&lon=${pos.lng}` +  `&units=metric&appid=` + APIKey;
        queryCall();
      });
    } else {
      // Browser doesn't support geolocation
      handleLocationError(false, infoWindow);
      queryURL = queryURL + `lat=${pos.lat}` + `&lon=${pos.lng}` +  `&units=metric&appid=` + APIKey;
      queryCall();
    }
  }


// queryCall(): Run AJAX call to the OpenWeatherMap API
//              queryURL is already constructed in initMap with coordinate information before queryCall()
function queryCall(){
$.ajax({
  url: queryURL,
  method: "GET"
})
  .then(function(reply) {
  // We store all of the retrieved data into global variable response as well so that it can be used in buildicon()
    response = reply;
    console.log(response);
    iconCode = reply.weather[0].icon;
    iconURL = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
    buildicon();
  });
}
//buildicon() : build small weather "widget" on bottom right corner of the html
  function buildicon(){
    console.log(queryURL);

    // Log the resulting object
    console.log(response);

    // Transfer content to HTML
    $(".city").text(response.name);
    $(".temp").text(response.main.temp + "°C");
    $(".description").text(response.weather[0].description);
    $(".icon").html("<img src=" + iconURL + ">");
    weatherStatus = response.weather[0].description.toLowerCase();
    //if weather is bad (drizzle, rain, storm, snow), add text recommending user to use public transit. Else recommend to walk.
    if (weatherStatus.includes("drizzle") || weatherStatus.includes("rain") || weatherStatus.includes("storm") || weatherStatus.includes("snow")){
      document.getElementById("weatherMsg").textContent = "Public transit recommended";
    }
    else{
      document.getElementById("weatherMsg").textContent = "Great weather for walking!";
    }

  }
