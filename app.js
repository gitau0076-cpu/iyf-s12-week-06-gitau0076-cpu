// API_KEY is supplied by config.js (kept out of version control).
const API_ROOT = "https://api.openweathermap.org/data/2.5";

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherDisplay = document.getElementById("weather-display");
const forecastDisplay = document.getElementById("forecast");

const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");

async function request(endpoint, params) {
    if (typeof API_KEY === "undefined" || !API_KEY) {
        throw new Error("Add your OpenWeather API key to config.js.");
    }

    const query = new URLSearchParams({ ...params, appid: API_KEY, units: "metric" });
    const response = await fetch(`${API_ROOT}/${endpoint}?${query}`);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 404) throw new Error("City not found. Check the spelling and try again.");
        if (response.status === 401) throw new Error("API key is invalid or not active yet.");
        throw new Error(data.message || "Could not fetch weather data.");
    }

    return data;
}

async function getWeather(city) {
    loading.classList.remove("hidden");
    error.classList.add("hidden");
    weatherDisplay.classList.add("hidden");
    forecastDisplay.classList.add("hidden");

    try {
        const params = { q: city };
        const data = await request("weather", params);
        displayWeather(data);
        saveToHistory(data.name);

        try {
            const forecastData = await request("forecast", params);
            displayForecast(forecastData);
        } catch (forecastError) {
            const reason = forecastError instanceof TypeError
                ? "Network error. Check your connection and try again."
                : forecastError.message;
            const message = document.createElement("p");
            message.className = "forecast-message";
            message.textContent = `Forecast unavailable: ${reason}`;
            forecastDisplay.replaceChildren(message);
            forecastDisplay.classList.remove("hidden");
        }
    } catch (requestError) {
        error.textContent = requestError instanceof TypeError
            ? "Network error. Check your connection and try again."
            : requestError.message;
        error.classList.remove("hidden");
    } finally {
        loading.classList.add("hidden");
    }
}

function displayWeather(data) {
    const condition = data.weather[0];
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${condition.icon}@2x.png`;
    weatherIcon.alt = condition.description;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = condition.description;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    document.body.dataset.weather = condition.main.toLowerCase();
    weatherDisplay.classList.remove("hidden");
}

function displayForecast(data) {
    if (!Array.isArray(data.list) || data.list.length === 0) {
        throw new Error("The weather service returned no forecast entries for this location.");
    }

    // API timestamps are UTC. Group by the city's local date and select the
    // available reading nearest to local noon so every forecast day is shown.
    const timezoneOffset = (data.city?.timezone || 0) * 1000;
    const grouped = new Map();

    for (const item of data.list) {
        const localTime = new Date(item.dt * 1000 + timezoneOffset);
        const dateKey = localTime.toISOString().slice(0, 10);
        const hour = localTime.getUTCHours() + localTime.getUTCMinutes() / 60;
        const distanceToNoon = Math.abs(hour - 12);
        const previous = grouped.get(dateKey);

        if (!previous || distanceToNoon < previous.distanceToNoon) {
            grouped.set(dateKey, { item, distanceToNoon });
        }
    }

    const forecastDays = [...grouped.entries()].slice(0, 5);
    forecastDisplay.replaceChildren();

    for (const [dateKey, entry] of forecastDays) {
        const day = entry.item;
        const condition = day.weather[0];
        const date = new Date(`${dateKey}T12:00:00Z`).toLocaleDateString(undefined, {
            weekday: "short",
            timeZone: "UTC"
        });

        const card = document.createElement("article");
        card.className = "forecast-day";

        const dayName = document.createElement("strong");
        dayName.textContent = date;

        const icon = document.createElement("img");
        icon.src = `https://openweathermap.org/img/wn/${condition.icon}.png`;
        icon.alt = condition.description;

        const temp = document.createElement("span");
        temp.textContent = `${Math.round(day.main.temp)}°C`;

        const summary = document.createElement("small");
        summary.textContent = condition.description;

        card.append(dayName, icon, temp, summary);
        forecastDisplay.append(card);
    }

    forecastDisplay.classList.remove("hidden");
}

function saveToHistory(city) {
    const previous = JSON.parse(localStorage.getItem("recent")) || [];
    const recent = [
        city,
        ...previous.filter(item => item.toLowerCase() !== city.toLowerCase())
    ].slice(0, 5);

    localStorage.setItem("recent", JSON.stringify(recent));
    renderHistory(recent);
}

function loadHistory() {
    const recent = JSON.parse(localStorage.getItem("recent")) || [];
    renderHistory(recent);
}

function renderHistory(recent) {
    const historyList = document.getElementById("search-history");
    historyList.replaceChildren();

    for (const city of recent) {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = city;
        button.addEventListener("click", () => {
            cityInput.value = city;
            getWeather(city);
        });
        item.append(button);
        historyList.append(item);
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) getWeather(city);
});

loadHistory();
