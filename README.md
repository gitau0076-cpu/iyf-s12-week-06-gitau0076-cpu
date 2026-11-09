# Week 6: Asynchronous JavaScript

## Project description

A browser-based weather dashboard built with HTML, CSS, and JavaScript. Search for a city to see current conditions and a five-day forecast. The app also supports recent searches, Celsius/Fahrenheit switching, and weather by geolocation. A Posts API section demonstrates loading data, filtering it, and sending a POST request.

## Live demo
[Live page](https://gitau0076-cpu.github.io/iyf-s12-week-06-gitau0076-cpu/)

## Project structure

```text
iyf-s12-week-06-gitau0076-cpu/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .vscode/
│   └── settings.json
├── Daily Challenges/
│   ├── day 1
│   ├── day 2
│   ├── day 3
│   ├── day 4
│   └── day 5
├── Lesson 11/
├── Lesson 12/
├── node_modules/
├── .env
├── .gitignore
├── app.js
├── config.example.js
├── config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── server.js
└── style.css 
```

## How to run
1. Get an API key from [OpenWeather](https://openweathermap.org/api).
2. Copy `config.example.js` to `config.js` and add your key to `API_KEY`.
3. Open `index.html` in a browser, or run a local static server from this folder.

`config.js` is excluded by `.gitignore`. Never commit your real API key.

## GitHub Pages Deployment
This repository deploys with GitHub Actions. In the repository settings:

1. Add an Actions repository secret named `OPENWEATHER_API_KEY` containing your OpenWeatherMap key.
2. Set Pages → Build and deployment → Source to **GitHub Actions**.
3. Push to `main` or run the **Deploy to GitHub Pages** workflow from the Actions tab.

The workflow creates the ignored `config.js` from the secret during deployment, so the key is not stored in the repository history. As with any browser-only application, the deployed site sends the key to visitors' browsers.

## Features

- Current temperature, conditions, feels-like temperature, humidity, wind speed, and pressure
- City search with friendly invalid-city, API-key, and network error messages
- Loading feedback while weather data is fetched
- Five recent searches saved in local storage
- Celsius/Fahrenheit toggle and current-location lookup
- Responsive layout for desktop and mobile

## Challenges faced

- Handling invalid cities, API errors, and network failures without leaving the page stuck in a loading state.
- Selecting one forecast entry per local calendar day from a list of three-hour forecast readings.
- Keeping the weather display in sync when searches or unit changes happen close together.
- Saving recent searches and rebuilding clickable buttons from `localStorage`.

## What I learned

- How to use `fetch`, check HTTP responses, and handle JSON data with promises and `async`/`await`.
- How to render API data in the DOM and provide loading and error feedback.
- How to send JSON in a POST request and filter displayed API data as the user types.
- How `Promise.allSettled` handles multiple requests and how `localStorage` can preserve data between visits.

## Future improvements

- Deploy the app with a backend proxy that keeps the weather API key private.
- Add automated tests for API failures, search filtering, and forecast rendering.
- Add saved locations, forecast details, and improved accessibility options.
- Persist created posts using a real backend instead of a demonstration API.
