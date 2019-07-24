

var APIKey = "d1c9275e14261ab240fbf7eb6420e249";


    // Choose whether to call by city name or coordinates
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?" +
      "q=Toronto,Canada&units=metric&appid=" + APIKey;
	
	// these coordinates are set to Toronto Canada by default	  
// var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=43.6532&lon=79.3832&appid=" + APIKey;

    // Here we run our AJAX call to the OpenWeatherMap API
   $.ajax({
      url: queryURL,
      method: "GET"
    })

      // We store all of the retrieved data inside of an object called "response"
      .then(function(response) {
        // declaring icon variables and url coordinated with the weather API
        var iconCode = response.weather[0].icon;
        var iconURL = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png";

        
        // Log the queryURL
        console.log(queryURL);
        // Log the resulting object
        console.log(response);

        // Transfer content to HTML
        $(".city").text(response.name);
        $(".temp").text(response.main.temp + "°C");
        $(".description").text(response.weather[0].description);
        $(".icon").html("<img src=" + iconURL + ">");
        //$(".wind").text("Wind Speed: " + response.wind.speed);
        //$(".humidity").text("Humidity: " + response.main.humidity);

        // Log the data in the console as well
        console.log("Wind Speed: " + response.wind.speed);
        console.log("Humidity: " + response.main.humidity);
        console.log("Temperature (°C): " + response.main.temp);

      });
