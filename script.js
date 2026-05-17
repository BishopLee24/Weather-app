/* =========================
   API Configuration
========================= */

const apiKey =
    "64a41df3b7699aaca782b2cf386ef1a8";


/* =========================
   DOM Elements
========================= */

const searchButton =
    document.getElementById("search-btn");

const cityInput =
    document.getElementById("city-input");

const weatherInfo =
    document.getElementById("weather-info");

const forecastContainer =
    document.getElementById("forecast");

const historyList =
    document.getElementById("history-list");

const clearHistoryButton =
    document.getElementById(
        "clear-history-btn"
    );

const unitToggleButton =
    document.getElementById(
        "unit-toggle-btn"
    );

const themeToggleButton =
    document.getElementById(
        "theme-toggle-btn"
    );


/* =========================
   Application State
========================= */

let searchHistory = [];

let currentUnit = "metric";

let currentCity = "";

let darkModeEnabled = false;


/* =========================
   Local Storage Hydration
========================= */

const savedHistory =
    localStorage.getItem(
        "searchHistory"
    );

if (savedHistory) {

    searchHistory =
        JSON.parse(savedHistory);

    [...searchHistory]
        .reverse()
        .forEach(function (city) {

            renderHistoryItem(city);
        });

    if (searchHistory.length > 0) {

        updateActiveHistory(
            searchHistory[0]
        );
    }
}


/* =========================
   Search Button Event
========================= */

searchButton.addEventListener(
    "click",
    function () {

        handleSearch();
    }
);


/* =========================
   Unit Toggle Event
========================= */

unitToggleButton.addEventListener(
    "click",
    function () {

    if (currentUnit === "metric") {

        currentUnit = "imperial";

    } else {

        currentUnit = "metric";
    }

    if (currentUnit === "metric") {

        unitToggleButton.textContent =
            "Switch to °F";

    } else {

        unitToggleButton.textContent =
            "Switch to °C";
    }

    console.log(currentUnit);

    if (currentCity !== "") {

        fetchWeather(currentCity);

        fetchForecast(currentCity);
    }
}
);


/* =========================
   Theme Toggle Event
========================= */

themeToggleButton.addEventListener(
    "click",
    function () {

        darkModeEnabled =
            !darkModeEnabled;

        if (darkModeEnabled) {

            document.body.classList.add(
                "dark-mode"
            );

        } else {

            document.body.classList.remove(
                "dark-mode"
            );
        }
    }
);


/* =========================
   Enter Key Search
========================= */

cityInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            handleSearch();
        }
    }
);


/* =========================
   Search History Click
========================= */

historyList.addEventListener(
    "click",
    function (event) {

        const city =
            event.target.dataset.city;

        if (city) {

            cityInput.value = city;

            handleSearch();
        }
    }
);


/* =========================
   Clear Search History
========================= */

clearHistoryButton.addEventListener(
    "click",
    function () {

        searchHistory = [];

        localStorage.removeItem(
            "searchHistory"
        );

        historyList.innerHTML = "";
    }
);


/* =========================
   Main Search Function
========================= */

function handleSearch() {

   const city =
    cityInput.value.trim();

    currentCity = city;

    if (city === "") {

        weatherInfo.innerHTML = `
            <p class="error">
                Please enter a city name.
            </p>
        `;

        forecastContainer.innerHTML = "";

        return;
    }


    /* =========================
       Loading States
    ========================== */

   weatherInfo.innerHTML = `
    <div class="loading-container">

        <div class="spinner"></div>

        <p class="loading">
            Loading weather data...
        </p>

    </div>
    `;

    forecastContainer.innerHTML = `
    <div class="loading-container">

        <div class="spinner"></div>

        <p class="loading">
            Loading forecast...
        </p>

    </div>
`;

    searchButton.disabled = true;


    /* =========================
       Fetch Weather Data
    ========================== */

    fetchWeather(city);

    fetchForecast(city);


    /* =========================
       Search History Logic
    ========================== */

    searchHistory =
        searchHistory.filter(function (item) {

            return item !== city;
        });

    searchHistory.unshift(city);

    searchHistory =
        searchHistory.slice(0, 5);

    localStorage.setItem(
        "searchHistory",
        JSON.stringify(searchHistory)
    );


    /* =========================
       Re-Render Search History
    ========================== */

    historyList.innerHTML = "";

    [...searchHistory]
        .reverse()
        .forEach(function (item) {

            renderHistoryItem(item);
        });


    /* =========================
       Active History Styling
    ========================== */

    updateActiveHistory(city);


    /* =========================
       Input Cleanup
    ========================== */

    cityInput.value = "";

    cityInput.focus();
}


/* =========================
   Render History Item
========================= */

function renderHistoryItem(city) {

    historyList.innerHTML = `
        <li data-city="${city}">
            ${city}
        </li>
    ` + historyList.innerHTML;
}


/* =========================
   Update Active History
========================= */

function updateActiveHistory(city) {

    const historyItems =
        document.querySelectorAll(
            "#history-list li"
        );

    historyItems.forEach(function (item) {

        item.classList.remove(
            "active-history"
        );

        if (
            item.dataset.city === city
        ) {

            item.classList.add(
                "active-history"
            );
        }
    });
}


/* =========================
   Temperature Unit Helper
========================= */

function getTemperatureUnit() {

    if (currentUnit === "metric") {

        return "C";

    } else {

        return "F";
    }
}


/* =========================
   Weather Theme Helper
========================= */

function updateWeatherTheme(weatherMain) {

    document.body.classList.remove(
        "clear-weather",
        "cloudy-weather",
        "rainy-weather",
        "snowy-weather"
    );

    if (weatherMain === "Clear") {

        document.body.classList.add(
            "clear-weather"
        );

    } else if (weatherMain === "Clouds") {

        document.body.classList.add(
            "cloudy-weather"
        );

    } else if (weatherMain === "Rain") {

        document.body.classList.add(
            "rainy-weather"
        );

    } else if (weatherMain === "Snow") {

        document.body.classList.add(
            "snowy-weather"
        );
    }
}


/* =========================
   Fetch Current Weather
========================= */

async function fetchWeather(city) {

    try {

        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`;

        const response =
            await fetch(url);

        const data =
            await response.json();

        if (data.cod === "404") {

            throw new Error(
                "City not found"
            );
        }

        const temperature =
            data.main.temp;

        const description =
            data.weather[0].description;

        const weatherMain =
            data.weather[0].main;

        updateWeatherTheme(weatherMain);

        const cityName =
            data.name;

        const iconCode =
            data.weather[0].icon;

        const iconUrl =
            `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        weatherInfo.innerHTML = `
            <div class="weather-card">

                <h2>${cityName}</h2>

                <img
                    src="${iconUrl}"
                    alt="Weather icon"
                >

                <p class="temperature">
                     ${temperature}°${getTemperatureUnit()}
                </p>

                <p class="description">
                    ${description}
                </p>

            </div>
        `;

        searchButton.disabled = false;

    } catch (error) {

        weatherInfo.innerHTML = `
            <p class="error">
                City not found.
                Please try again.
            </p>
        `;

        forecastContainer.innerHTML = "";

        searchButton.disabled = false;

        console.error(error);
    }
}


/* =========================
   Fetch Forecast
========================= */

async function fetchForecast(city) {

    try {

       const forecastUrl =
           `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${currentUnit}`;

        const response =
            await fetch(forecastUrl);

        const data =
            await response.json();

        if (data.cod === "404") {

            throw new Error(
                "Forecast not found"
            );
        }

        forecastContainer.innerHTML = "";

        for (
            let i = 0;
            i < data.list.length;
            i += 8
        ) {

            const forecastItem =
                data.list[i];

            const forecastDate =
                forecastItem.dt_txt;

            const date =
                new Date(forecastDate);

            const formattedDate =
                date.toLocaleDateString();

            const forecastTemp =
                forecastItem.main.temp;

            const forecastDescription =
                forecastItem.weather[0].description;

            const forecastIcon =
                forecastItem.weather[0].icon;

            const forecastIconUrl =
                `https://openweathermap.org/img/wn/${forecastIcon}@2x.png`;

            forecastContainer.innerHTML += `
                <div class="forecast-card">

                    <h3>${formattedDate}</h3>

                    <img
                        src="${forecastIconUrl}"
                        alt="Forecast weather icon"
                    >

                    <p>
                        ${forecastTemp}°
                        ${getTemperatureUnit()}
                    </p>

                    <p>${forecastDescription}</p>

                </div>
            `;
        }

    } catch (error) {

        forecastContainer.innerHTML = `
            <p class="error">
                Forecast data unavailable.
            </p>
        `;

        console.error(error);
    }
}