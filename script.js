// ===== Object Collection =====

const ProductivityDashboard = {
  // =========================
  // Element Collections
  // =========================

  elements: {
    html: null,
    themeBtn: null,
    weather: {
      city: null,
      temperature: null,
      condition: null,
      precipitation: null,
      humidity: null,
      wind: null,
    },
    clock: {
      date: null,
      time: null,
    },
    weatherBanner: null,
  },

  // =========================
  // State
  // =========================

  state: {
    currentTheme: 0,

    weatherData: null,

    location: {
      latitude: null,
      longitude: null,
    },
  },

  // =========================
  // Config
  // =========================

  config: {
    themes: ["theme-1", "theme-2", "theme-3", "theme-4", "theme-5"],

    weather: {
      apiKey: "",
      apiUrl: "https://api.openweathermap.org/data/2.5/weather",
    },

    map: {
      apiKey: "",

      apiUrl: "https://maps.geoapify.com/v1/staticmap",

      style: "klokantech-basic",

      zoom: 11,
    },

    weatherThemes: [
      "clear-day",
      "clear-night",

      "clouds-day",
      "clouds-night",

      "rain-day",
      "rain-night",

      "thunderstorm-day",
      "thunderstorm-night",

      "snow-day",
      "snow-night",

      "mist-day",
      "mist-night",

      "fog-day",
      "fog-night",
    ],

    storageKeys: {
      theme: "productivity-theme",
    },
  },

  // =========================
  // Storage
  // =========================

  storage: {
    saveData(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },

    getData(key) {
      return JSON.parse(localStorage.getItem(key));
    },
  },

  // =========================
  // Theme Logic
  // =========================

  theme: {
    changeTheme() {
      const themes = ProductivityDashboard.config.themes;

      const currentTheme = ProductivityDashboard.state.currentTheme;

      const html = ProductivityDashboard.elements.html;

      html.classList.remove(themes[currentTheme]);

      ProductivityDashboard.state.currentTheme =
        (currentTheme + 1) % themes.length;

      const nextTheme = themes[ProductivityDashboard.state.currentTheme];

      html.classList.add(nextTheme);

      ProductivityDashboard.storage.saveData(
        ProductivityDashboard.config.storageKeys.theme,
        ProductivityDashboard.state.currentTheme,
      );
    },

    loadTheme() {
      const savedTheme = ProductivityDashboard.storage.getData(
        ProductivityDashboard.config.storageKeys.theme,
      );

      if (savedTheme === null) return;

      ProductivityDashboard.state.currentTheme = savedTheme;

      ProductivityDashboard.elements.html.classList.remove(
        ...ProductivityDashboard.config.themes,
      );

      ProductivityDashboard.elements.html.classList.add(
        ProductivityDashboard.config.themes[savedTheme],
      );
    },
  },

  // =========================
  // Weather Logic
  // =========================

  weather: {
    async fetchWeather() {
      try {
        const latitude = ProductivityDashboard.state.location.latitude;

        const longitude = ProductivityDashboard.state.location.longitude;

        const apiKey = ProductivityDashboard.config.weather.apiKey;

        const url = `${ProductivityDashboard.config.weather.apiUrl}?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

        const response = await fetch(url);

        const data = await response.json();

        console.log(data);

        ProductivityDashboard.state.weatherData = {
          city: data.name,

          country: data.sys.country,

          temperature: Math.round(data.main.temp),

          feelsLike: Math.round(data.main.feels_like),

          humidity: data.main.humidity,

          condition: data.weather[0].main,

          description: data.weather[0].description,

          icon: data.weather[0].icon,

          sunrise: data.sys.sunrise,

          sunset: data.sys.sunset,

          wind: Math.round(data.wind.speed * 3.6),

          precipitation: data.clouds?.all ?? 0,

          isDay: data.dt > data.sys.sunrise && data.dt < data.sys.sunset,

          latitude: ProductivityDashboard.state.location.latitude,

          longitude: ProductivityDashboard.state.location.longitude,
        };
        this.updateBanner();
        ProductivityDashboard.map.updateMap();
      } catch (error) {
        console.error("Weather Fetch Error:", error);
      }
    },

    getLocation() {
      navigator.geolocation.getCurrentPosition((position) => {
        ProductivityDashboard.state.location.latitude =
          position.coords.latitude;

        ProductivityDashboard.state.location.longitude =
          position.coords.longitude;

        console.log(ProductivityDashboard.state.location);

        this.fetchWeather();
      });
    },

    updateBanner() {
      const weather = ProductivityDashboard.state.weatherData;

      ProductivityDashboard.elements.weather.city.textContent = `${weather.city} (${weather.country})`;

      ProductivityDashboard.elements.weather.temperature.textContent = `${weather.temperature}°C`;

      ProductivityDashboard.elements.weather.condition.textContent =
        weather.description;

      ProductivityDashboard.elements.weather.humidity.textContent = `Humidity: ${weather.humidity}%`;

      ProductivityDashboard.elements.weather.precipitation.textContent = `Precipitation: ${weather.precipitation}%`;

      ProductivityDashboard.elements.weather.wind.textContent = `Wind: ${weather.wind} km/h`;
      this.applyWeatherTheme();
    },

    getWeatherTheme() {
      const weather = ProductivityDashboard.state.weatherData;

      const condition = this.normalizeCondition(weather.condition);

      const timeOfDay = weather.isDay ? "day" : "night";

      return `${condition}-${timeOfDay}`;
    },

    applyWeatherTheme() {
      const banner = ProductivityDashboard.elements.weatherBanner;

      const weatherTheme = this.getWeatherTheme();

      banner.classList.remove(...ProductivityDashboard.config.weatherThemes);

      banner.classList.add(weatherTheme);
    },

    startWeatherUpdates() {
      this.getLocation();

      setInterval(() => {
        this.getLocation();
      }, 3600000);
    },

    normalizeCondition(condition) {
      const weatherMap = {
        Clear: "clear",

        Clouds: "clouds",

        Rain: "rain",

        Drizzle: "rain",

        Thunderstorm: "thunderstorm",

        Snow: "snow",

        Mist: "mist",

        Fog: "fog",

        Haze: "fog",

        Smoke: "fog",

        Dust: "fog",

        Sand: "fog",

        Ash: "fog",
      };

      return weatherMap[condition] || "clear";
    },
  },

  // =========================
  // Clock Logic
  // =========================

  clock: {
    updateClock() {
      const now = new Date();

      const date = now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const day = now.toLocaleDateString("en-US", {
        weekday: "long",
      });

      ProductivityDashboard.elements.clock.date.textContent = date;

      ProductivityDashboard.elements.clock.time.textContent = `${day}, ${time}`;
    },

    startClock() {
      this.updateClock();

      setInterval(() => {
        this.updateClock();
      }, 1000);
    },
  },

  // =========================
  // Map Logic
  // =========================

  map: {
    updateMap() {
      const weather = ProductivityDashboard.state.weatherData;

      const config = ProductivityDashboard.config.map;

      const mapUrl = `${config.apiUrl}?style=${config.style}&width=1200&height=600&center=lonlat:${weather.longitude},${weather.latitude}&zoom=${config.zoom}&apiKey=${config.apiKey}`;

      ProductivityDashboard.elements.weatherBanner.style.setProperty(
        "--banner-map",
        `url("${mapUrl}")`,
      );
    },
  },

  // =========================
  // Element Collection
  // =========================

  cacheElements() {
    this.elements.html = document.documentElement;

    this.elements.themeBtn = document.querySelector(".theme-btn");

    this.elements.weather.city = document.querySelector("#current-location");

    this.elements.weather.temperature = document.querySelector("#temperature");

    this.elements.weather.condition = document.querySelector("#condition");

    this.elements.weather.precipitation =
      document.querySelector("#precipitation");

    this.elements.weather.humidity = document.querySelector("#humidity");

    this.elements.weather.wind = document.querySelector("#wind");

    this.elements.clock.date = document.querySelector("#current-date");

    this.elements.clock.time = document.querySelector("#current-time");

    this.elements.weatherBanner = document.querySelector(".weather-banner");
  },

  // =========================
  // Event Listeners
  // =========================

  bindEvents() {
    this.elements.themeBtn.addEventListener("click", () =>
      this.theme.changeTheme(),
    );
  },

  // =========================
  // Initialization
  // =========================

  init() {
    this.cacheElements();

    this.theme.loadTheme();

    this.weather.startWeatherUpdates();

    this.clock.startClock();

    this.bindEvents();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  ProductivityDashboard.init();
});
