
const egyptCities = [
    { latitude: 30.0444, longitude: 31.2357 },
    { latitude: 31.2001, longitude: 29.9187 },
    { latitude: 31.0409, longitude: 31.3785 },
    { latitude: 26.1642, longitude: 32.7267 },
    
    { latitude: 40.7128, longitude: -74.0060 },  
    { latitude: 51.5074, longitude: -0.1278 },   // London
    { latitude: 52.5200, longitude: 13.4050 },   // Berlin
    { latitude: 48.8566, longitude: 2.3522 },    // Paris
    { latitude: 35.6762, longitude: 139.6503 }    // Tokyo
];


const API_KEY = "6d055e39ee237af35ca066f35474e9df"; // Get your key from https://openweathermap.org/

const cairoBtn = document.getElementById("cairo");
const alexBtn = document.getElementById("alex");
const mansBtn = document.getElementById("mans");
const qenBtn = document.getElementById("qen");
const newYourkBtn = document.getElementById("ny");
const londonBtn = document.getElementById("lon");
const berlinBtn = document.getElementById("berlin");
const parisBtn = document.getElementById("paris");
const tokyoBtn = document.getElementById("tokyo");


const weatherCard = document.querySelector(".weather-card");
const cityNameElement = weatherCard.querySelector("h2");
const temperatureElement = weatherCard.querySelector("h1");
const conditionElement = weatherCard.querySelector(".condition");
const locationElement = weatherCard.querySelector(".location");
const weatherIconElement = weatherCard.querySelector("img");
const humidityElement = weatherCard.querySelector(".weather-details .detail-box:nth-child(1) h4");
const windSpeedElement = weatherCard.querySelector(".weather-details .detail-box:nth-child(2) h4");
const feelsLikeElement = weatherCard.querySelector(".weather-details .detail-box:nth-child(3) h4");
const pressureElement = weatherCard.querySelector(".weather-details .detail-box:nth-child(4) h4");
const getLocationBtn = weatherCard.querySelector(".button-group button:nth-child(1)");
const refreshWeatherBtn = weatherCard.querySelector(".button-group button:nth-child(2)");



async function getLatitudeLongitude() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    resolve({ latitude, longitude });
                },
                (error) => {
                    showError(error);
                    reject(error);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
}

async function fetchWeather(latitude, longitude) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        showError(error);
        throw error;
    }
}


async function fetchForecast(latitude, longitude) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch forecast data");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        showError(error);
        throw error;
    }
}

async function openLocation() {
    const { latitude, longitude } = await getLatitudeLongitude();

    let url = "https://www.google.pl/maps?q=" + latitude + "," + longitude;
    window.open(url, "_blank");
}


function updateWeatherUI(weatherData) {
 

    const temperature = Math.round(weatherData.main.temp);
    const condition = weatherData.weather[0].description;
    const location = weatherData.name + ", " + weatherData.sys.country;
    const iconCode = weatherData.weather[0].icon;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const feelsLike = Math.round(weatherData.main.feels_like);
    const pressure = weatherData.main.pressure;

    cityNameElement.textContent = weatherData.name;
    temperatureElement.textContent = `${temperature}°C`;
    conditionElement.textContent = condition;
    locationElement.textContent = location;
    weatherIconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    humidityElement.textContent = `${humidity}%`;
    windSpeedElement.textContent = `${windSpeed} km/h`;
    feelsLikeElement.textContent = `${feelsLike}°C`;
    pressureElement.textContent = `${pressure} hPa`;

    updateBackground(condition.toLowerCase());
}

function updateForecastUI(forecastData) {
    const forecastItems = document.querySelectorAll(".forecast-item");
    const dailyData = forecastData.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
    ); 

    dailyData.slice(0, 5).forEach((day, index) => {
        const date = new Date(day.dt_txt);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const temp = Math.round(day.main.temp);
        const iconCode = day.weather[0].icon;

        forecastItems[index].querySelector("p:first-child").textContent = dayName;
        forecastItems[index].querySelector("img").src = `https://openweathermap.org/img/wn/${iconCode}.png`;
        forecastItems[index].querySelector("p:last-child").textContent = `${temp}°C`;
    });
}


function updateBackground(condition) {
    const body = document.body;
    if (condition.includes("clear")) {
        body.style.background = "url('./Icons/clear.avif') no-repeat center center/cover"
    } else if (condition.includes("clouds")) {
        body.style.background = "url('./Icons/cloud.avif') no-repeat center center/cover";
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
        body.style.background = "url('./Icons/rain.avif') no-repeat center center/cover";
    } else if (condition.includes("sunny")) {
        body.style.background = "url('./Icons/sunny.jpg') no-repeat center center/cover";
    } else {
        body.style.background = "url('./Icons/default.avif') no-repeat center center/cover"; // Default
    }
}


function showError(error) {
    let message;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            message = "Location access denied. Please allow location access to get weather data.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            message = "The request to get location timed out.";
            break;
        default:
            message = error.message || "An error occurred while fetching data.";
    }
    alert(message);
}


async function getWeatherforLocation() {
    try {

        temperatureElement.textContent = "Loading...";


        const { latitude, longitude } = await getLatitudeLongitude();

        const weatherData = await fetchWeather(latitude, longitude);
        const forecastData = await fetchForecast(latitude, longitude);

        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
    } catch (error) {
        console.error("Error in getWeather:", error);
        temperatureElement.textContent = "Error";
    }
}
async function getWeatherforCity(index) {
    try {
    
        temperatureElement.textContent = "Loading...";

        const { latitude, longitude } = egyptCities[index];

       
        const weatherData = await fetchWeather(latitude, longitude);
        const forecastData = await fetchForecast(latitude, longitude);

        updateWeatherUI(weatherData);
        updateForecastUI(forecastData);
    } catch (error) {
        console.error("Error in getWeather:", error);
        temperatureElement.textContent = "Error";
    }
}


getLocationBtn.addEventListener("click", openLocation);
refreshWeatherBtn.addEventListener("click", getWeatherforLocation);
cairoBtn.addEventListener("click", () => getWeatherforCity(0));
alexBtn.addEventListener("click", () => getWeatherforCity(1));
mansBtn.addEventListener("click", () => getWeatherforCity(2));
qenBtn.addEventListener("click", () => getWeatherforCity(3));
newYourkBtn.addEventListener("click", () => getWeatherforCity(4));
londonBtn.addEventListener("click", () => getWeatherforCity(5));
berlinBtn.addEventListener("click", () => getWeatherforCity(6));
parisBtn.addEventListener("click", () => getWeatherforCity(7));
tokyoBtn.addEventListener("click", () => getWeatherforCity(8));


document.addEventListener("DOMContentLoaded", getWeatherforLocation);