let celciusTemperature = null;
let celciusTemperatureForecastResponse = null;

function formatDate(timezoneSeconds) {
  let now = new Date();
  let currentUnixTimestamp = now.getTime();
  let currentTimezone = now.getTimezoneOffset() * 60000;
  let utcTime = currentUnixTimestamp + currentTimezone;

  let dateSecTargetCity = utcTime / 1000 + timezoneSeconds;
  let dateTargetCity = new Date(dateSecTargetCity * 1000);
  console.log(dateTargetCity);

  let hours = dateTargetCity.getHours();

  if (hours < 10) {
    hours = `0${hours}`;
  }
  let minutes = dateTargetCity.getMinutes();

  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let day = days[dateTargetCity.getDay()];
  return `${day}  ${hours}:${minutes}`;
}

function formatDay(timestampUTCSec, timezoneSeconds) {
  let dateSecTargetCity = timestampUTCSec + timezoneSeconds;
  let dateTargetCity = new Date(dateSecTargetCity * 1000);

  let day = dateTargetCity.getDay();
  let days = ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"];
  return days[day];
}

function convertTemperatureUnit(temperatureCentigrade, targetUnit = "metric") {
  if (targetUnit == "metric") {
    return temperatureCentigrade;
  } else {
    return Math.round((temperatureCentigrade * 9) / 5 + 32);
  }
}

function displayForecast(response, unit = "metric") {
  if (unit === "metric") {
    // Save on first invocation, from axios.
    // From then on, this is redundant.
    celciusTemperatureForecastResponse = response;
  }

  let forecast = response.data.daily;

  let forecastElement = document.querySelector("#forecast");
  let forecastHTML = `<div class="row">`;
  forecast.forEach(function (forecastDay, index) {
    if (index < 6) {
      forecastHTML =
        forecastHTML +
        ` <div class="col-2">
                <div class="weather-forecast-date">${formatDay(
                  forecastDay.dt,
                  response.data.timezone_offset
                )}</div>
                <img
                  src="http://openweathermap.org/img/wn/${
                    forecastDay.weather[0].icon
                  }@2x.png"
                  alt=""
                  width="60"
                /><br />
                <div class="weather-forecast-temperatures">
                  <span class="weather-forecast-temperature-max">${Math.round(
                    convertTemperatureUnit(forecastDay.temp.max, unit)
                  )}°</span
                  ><span class="weather-forecast-temperature-min">${Math.round(
                    convertTemperatureUnit(forecastDay.temp.min, unit)
                  )}°</span>
                </div>
              </div>`;
    }
  });
  forecastHTML = forecastHTML + `</div>`;
  forecastElement.innerHTML = forecastHTML;
}
function getForecast(coordinates) {
  let apiKey = "c6bf549ec646257615a2c5390e834788";

  let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`;

  axios.get(apiUrl).then(displayForecast);
}
function displayTemperature(response) {
  console.log(response);
  let temperatureElement = document.querySelector("#temperature");
  let cityElement = document.querySelector("#city");
  let descriptionElement = document.querySelector("#description");
  let humidityElement = document.querySelector("#humidity");
  let windElement = document.querySelector("#wind");
  let dayTimeElement = document.querySelector("#day-time");
  let iconElement = document.querySelector("#icon");

  celciusTemperature = response.data.main.temp;

  temperatureElement.innerHTML = Math.round(celciusTemperature);
  cityElement.innerHTML = response.data.name;
  descriptionElement.innerHTML = response.data.weather[0].description;
  humidityElement.innerHTML = response.data.main.humidity;
  windElement.innerHTML = Math.round(response.data.wind.speed);
  dayTimeElement.innerHTML = formatDate(response.data.timezone);
  let weatherDescription = response.data.weather[0].description;

  iconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
  );
  iconElement.setAttribute("alt", response.data.weather[0].description);

  getForecast(response.data.coord);
}

function search(city) {
  let apiKey = "c6bf549ec646257615a2c5390e834788";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  axios.get(apiUrl).then(displayTemperature);
}
function handleSubmit(event) {
  event.preventDefault();
  let cityInputElement = document.querySelector("#city-input");
  search(cityInputElement.value);
}

function currentLocation(position) {
  let apiKey = "c6bf549ec646257615a2c5390e834788";
  let apiUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}&units=metric`;
  console.log(apiUrlCurrent);
  axios.get(apiUrlCurrent).then(displayTemperature);
}
function currentLocationTemperature(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(currentLocation);
}

function displayFahrenheitTemperature(event) {
  event.preventDefault();
  celciusLink.classList.remove("active");
  fahrenheitLink.classList.add("active");
  let fahrenheitTemperature = Math.round((celciusTemperature * 9) / 5 + 32);
  let temperatureElement = document.querySelector("#temperature");
  temperatureElement.innerHTML = fahrenheitTemperature;

  displayForecast(celciusTemperatureForecastResponse, "imperial");
}

function displayCelciusTemperature(event) {
  event.preventDefault();
  celciusLink.classList.add("active");
  fahrenheitLink.classList.remove("active");
  let temperatureElement = document.querySelector("#temperature");
  temperatureElement.innerHTML = Math.round(celciusTemperature);

  displayForecast(celciusTemperatureForecastResponse, "metric");
}

let form = document.querySelector("#search-form");
form.addEventListener("submit", handleSubmit);

let currentButton = document.querySelector("#current");
currentButton.addEventListener("click", currentLocationTemperature);

let fahrenheitLink = document.querySelector("#fahrenheit-link");
fahrenheitLink.addEventListener("click", displayFahrenheitTemperature);

let celciusLink = document.querySelector("#celcius-link");
celciusLink.addEventListener("click", displayCelciusTemperature);

search("Tokyo");
