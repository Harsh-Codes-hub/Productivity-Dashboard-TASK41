// ===== Object Collection =====

const ProductivityDashboard = {
  // =========================
  // Element Collections
  // =========================

  elements: {
    html: null,
    themeBtn: null,
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
      apiKey: "apiKey",
      apiUrl: "https://api.openweathermap.org/data/2.5/weather",
    },

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
        console.log(apiKey.length);

        const url = `${ProductivityDashboard.config.weather.apiUrl}?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
        console.log(url);

        const response = await fetch(url);
        console.log(response);

        const data = await response.json();

        ProductivityDashboard.state.weatherData = data;

        console.log(ProductivityDashboard.state.weatherData);
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

        ProductivityDashboard.weather.fetchWeather();
      });
    },
    updateBanner() {
      console.log("Updating Banner...");
    },
  },

  // =========================
  // Element Collection
  // =========================

  cacheElements() {
    this.elements.html = document.documentElement;

    this.elements.themeBtn = document.querySelector(".theme-btn");
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

    this.weather.getLocation();

    this.bindEvents();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  ProductivityDashboard.init();
});
