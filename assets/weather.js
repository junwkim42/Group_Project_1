var APIKey = "d1c9275e14261ab240fbf7eb6420e249";
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
//lat: 43.6543, lng: -79.3860 
// Choose whether to call by city name or coordinates
//q=Toronto,Canada
var queryURL = "https://api.openweathermap.org/data/2.5/weather?";
 //+  "lat=43.6543&lon=-79.3860&units=metric&appid=" + APIKey;

  function initMap() {
    // Initialize variables
    bounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow;
    currentInfoWindow = infoWindow;
    /* TODO: Step 4A3: Add a generic sidebar */
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
// these coordinates are set to Toronto Canada by default	  
// var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=43.6532&lon=79.3832&appid=" + APIKey;

// Here we run our AJAX call to the OpenWeatherMap API
function queryCall(){
$.ajax({
  url: queryURL,
  method: "GET"
})
  // We store all of the retrieved data inside of an object called "response"
  .then(function(reply) {
     // declaring icon variables
    response = reply;
    console.log(response);
    iconCode = reply.weather[0].icon;
    iconURL = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
    buildicon();
  });
}
    // Log the queryURL
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
    if (weatherStatus.includes("rain") || weatherStatus.includes("storm") || weatherStatus.includes("snow")){
      document.getElementById("weatherMsg").textContent = "Public transit recommended";
    }
    else{
      document.getElementById("weatherMsg").textContent = "Great weather for walking!";
    }

  }
