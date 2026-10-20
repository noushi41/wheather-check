
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

async function getWeather() {
    const city = cityInput.value.trim() + ", India";

    if (city === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Loading weather...";
    searchBtn.disabled = true;

    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Could not search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please check the spelling.");
        }

        const place = geoData.results[0];
        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
        console.log("Weather URL:", url);
        const weatherResponse = await fetch(url);

        if (!weatherResponse.ok) {
            throw new Error("Could not get weather data. Try again.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        cityName.textContent = `${place.name}, ${place.country}`;
        temperature.textContent = `${current.temperature_2m}°C`;
        description.textContent = getDescription(current.weather_code);
        humidity.textContent = `Humidity: ${current.relative_humidity_2m}%`;
        wind.textContent = `Wind Speed: ${current.wind_speed_10m} km/h`;

        message.textContent = "";
    } catch (error) {
        message.textContent = error.message ||
            "Something went wrong. Please try again.";
    } finally {
        searchBtn.disabled = false;
    }
}

function getDescription(code) {
    if (code === 0) return "Clear sky ☀️";
    if (code === 1) return "Mainly clear 🌤️";
    if (code === 2) return "Partly cloudy ⛅";
    if (code === 3) return "Overcast ☁️";
    if ([45, 48].includes(code)) return "Foggy 🌫️";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle 🌦️";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return "Rainy 🌧️";
    }
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy ❄️";
    if ([95, 96, 99].includes(code)) return "Thunderstorm ⛈️";
    return "Weather information available";
}
