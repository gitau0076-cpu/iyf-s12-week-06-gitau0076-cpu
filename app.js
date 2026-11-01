// ============================================
// LESSON 12 — CLASSWORK EXERCISE: Weather Dashboard (Week 6 deliverable + graded gate)
// GIVEN: index.html, styles.css, .gitignore, config.example.js, .github/workflows/deploy.yml
// YOU WRITE: this file.  Everything goes at the ROOT of iyf-s12-week-06-{username}.
//
// STEP 0 — THE KEY, BEFORE ANY COMMIT (do this first, with the class):
//   1. copy config.example.js → config.js, paste your OpenWeatherMap key in config.js
//   2. git status  →  config.js must NOT be listed (the .gitignore hides it)
//   3. NEVER type the key in this file. API_KEY already exists: config.js defines it.
//   Season 11: 31 of 34 repos leaked a key. A key in git history stays forever (-5).
// ============================================

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const MAX_RECENT = 5;

// ---------- DOM elements (given) ----------
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const weatherDisplay = document.getElementById("weather-display");
const historyList = document.getElementById("search-history");

const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");


// ============================================
// STEP 1 — fetchWeather(city): fetch, check response.ok, return the JSON
//   - URL: `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
//   - if (!response.ok):  404 → throw new Error("City not found")
//                         401 → throw new Error("API key not valid yet …")
//                         else → throw new Error("Failed to fetch weather data")
//   WHY: fetch does NOT reject on 404. It only rejects when there's no network.
// ============================================
async function fetchWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("City not found");
    }
    if (response.status === 401) {
      throw new Error("API key not valid yet — check your key and try again later");
    }
    throw new Error("Failed to fetch weather data");
  }

  return response.json();
}


// ============================================
// STEP 2 — getWeather(city): the three states
//   - if API_KEY is missing (typeof API_KEY === "undefined" || !API_KEY):
//       showError("Missing API key: copy config.example.js to config.js …") and return
//   - showLoading(); hideError();
//   - try    { const data = await fetchWeather(city); displayWeather(data); saveToHistory(data.name); }
//   - catch  { showError(err.name === "TypeError" ? "Network error — check your connection" : err.message); }
//   - finally{ hideLoading(); }   ← runs whether it worked or not
// ============================================
async function getWeather(city) {
  if (typeof API_KEY === "undefined" || !API_KEY) {
    showError("Missing API key: copy config.example.js to config.js and add your key");
    return;
  }

  showLoading();
  hideError();

  try {
    const data = await fetchWeather(city);
    displayWeather(data);
    saveToHistory(data.name);
  } catch (err) {
    showError(err.name === "TypeError" ? "Network error — check your connection" : err.message);
  } finally {
    hideLoading();
  }
}


// ============================================
// STEP 3 — displayWeather(data): fill all EIGHT fields with textContent
//   city "Nairobi, KE" (data.name, data.sys.country) · icon src + alt
//   temperature "23°C" (Math.round) · description · feels like · humidity "60%"
//   wind "4.12 m/s" · pressure "1018 hPa"
//   then remove "hidden" from weatherDisplay
//   Tip: console.log(data) first and read the shape.
// ============================================
function displayWeather(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.alt = data.weather[0].description;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  description.textContent = data.weather[0].description;
  feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${data.wind.speed} m/s`;
  pressure.textContent = `${data.main.pressure} hPa`;
  weatherDisplay.classList.remove("hidden");
}

// Helpers (given)
function showLoading() { loading.classList.remove("hidden"); weatherDisplay.classList.add("hidden"); }
function hideLoading() { loading.classList.add("hidden"); }
function showError(message) { errorBox.textContent = message; errorBox.classList.remove("hidden"); }
function hideError() { errorBox.classList.add("hidden"); }


// ============================================
// STEP 4 — recent searches in localStorage (a preview of Week 7)
//   loadRecent(): JSON.parse(localStorage.getItem("recent")) || []   — wrap in try/catch
//   saveToHistory(city): put city first, remove any duplicate (ignore case),
//                        keep 5, localStorage.setItem("recent", JSON.stringify(recent)), renderHistory()
//   renderHistory(): one <li><button class="history-item">city</button></li> per city (textContent)
// ============================================
function loadRecent() {
  try {
    const saved = JSON.parse(localStorage.getItem("recent"));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
function saveToHistory(city) {
  recent = [city, ...recent.filter(item => item.toLowerCase() !== city.toLowerCase())]
    .slice(0, MAX_RECENT);
  localStorage.setItem("recent", JSON.stringify(recent));
  renderHistory();
}
function renderHistory() {
  historyList.textContent = "";

  recent.forEach(city => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.textContent = city;
    item.appendChild(button);
    historyList.appendChild(item);
  });
}
let recent = loadRecent();


// ============================================
// STEP 5 — events
//   - submit on the form: preventDefault, trim, getWeather(city)
//   - ONE click listener on historyList (delegation, Week 5):
//       const btn = event.target.closest(".history-item"); if (btn) getWeather(btn.textContent);
// ============================================

form.addEventListener("submit", event => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  }
});

historyList.addEventListener("click", event => {
  const btn = event.target.closest(".history-item");
  if (btn) {
    getWeather(btn.textContent);
  }
});


renderHistory();


// ============================================
// STEP 6 — DEPLOY (the graded gate) — see the task file, "Deploy — the graded gate"
//   1. Settings → Secrets and variables → Actions → New repository secret
//        Name: OPENWEATHER_API_KEY    Value: your key
//   2. Settings → Pages → Source: GitHub Actions
//   3. .github/workflows/deploy.yml is already here — commit it and push
//   4. Actions tab → green tick → open the URL
//   CHECK:  git log -p | grep -i appid   → only ${API_KEY}, never a real key
//
// COMMITS as you go:
//   git commit -m "Add: weather fetch with response.ok check"
//   git commit -m "Add: loading, error and success states"
//   git commit -m "Add: recent searches in localStorage"
//   git commit -m "Add: GitHub Pages deploy workflow"
// ============================================
