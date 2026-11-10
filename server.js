require("dotenv").config();

const express = require("express");

const app = express();

const PORT = 3000;

const API_KEY = process.env.OPENWEATHER_API_KEY;

app.get("/weather", async (req, res) => {

    try {

        const city = req.query.city;

        if (!city) {
            return res.status(400).json({
                error: "Please provide a city name."
            });
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: data.message || "Weather request failed."
            });
        }

        res.json(data);

    } catch (error) {

        res.status(500).json({
            error: "Server error. Please try again."
        });

    }

});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});