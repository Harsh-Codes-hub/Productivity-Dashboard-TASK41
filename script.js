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
    cards: null,
    panels: null,
    closeBtns: null,
    panelWrapper: null,
    panelOverlay: null,
    todo: {
      input: null,
      details: null,
      important: null,
      submitBtn: null,
      taskContainer: null,
      emptyState: null,
    },
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

    activePanel: null,

    todos: [],
  },

  // =========================
  // Config
  // =========================

  config: {
    themes: ["theme-1", "theme-2", "theme-3", "theme-4", "theme-5"],

    weather: {
      apiKey: "api_key",
      apiUrl: "https://api.openweathermap.org/data/2.5/weather",
    },

    map: {
      apiKey: "api_key",

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
      todos: "productivity-todos",
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
  // Panel Logic
  // =========================

  panel: {
    open(panelName) {
      ProductivityDashboard.elements.panelWrapper.style.display = "grid";

      const panel = document.querySelector(`.${panelName}-panel`);

      panel.classList.add("active");

      ProductivityDashboard.state.activePanel = panelName;

      ProductivityDashboard.elements.panelOverlay.classList.add("active");
      console.log(panelName);
    },

    close() {
      ProductivityDashboard.elements.panels.forEach((panel) => {
        panel.classList.remove("active");
      });

      ProductivityDashboard.elements.panelWrapper.style.display = "none";

      ProductivityDashboard.state.activePanel = null;

      ProductivityDashboard.elements.panelOverlay.classList.remove("active");
    },
  },

  // =========================
  // Todo Logic
  // =========================

  todo: {
    addTask() {
      const title = ProductivityDashboard.elements.todo.input.value.trim();

      const details = ProductivityDashboard.elements.todo.details.value.trim();

      const important = ProductivityDashboard.elements.todo.important.checked;

      if (!title) return;

      const task = {
        id: Date.now(),
        title,
        details,
        important,
      };

      ProductivityDashboard.state.todos.push(task);

      ProductivityDashboard.storage.saveData(
        ProductivityDashboard.config.storageKeys.todos,
        ProductivityDashboard.state.todos,
      );

      ProductivityDashboard.todo.renderTasks();

      ProductivityDashboard.elements.todo.input.value = "";

      ProductivityDashboard.elements.todo.details.value = "";

      ProductivityDashboard.elements.todo.important.checked = false;

      console.log(ProductivityDashboard.state.todos);
    },

    renderTasks() {
      const container = ProductivityDashboard.elements.todo.taskContainer;

      const todos = ProductivityDashboard.state.todos;

      if (todos.length === 0) {
        container.innerHTML = `<div class="empty-state">
        No Tasks Left
      </div>`;

        return;
      }

      container.innerHTML = "";

      todos.forEach((task) => {
        container.innerHTML += `<article class="todo-task" data-id="${task.id}">
        <div class="todo-task-content">
        <h4>
          ${task.important ? "⭐ " : ""}
          ${task.title}
        </h4>
        <p>${task.details || ""}</p>
        </div>
        <button class="task-done-btn" data-id="${task.id}"> Done</button>
        </article> `;
      });
    },

    loadTasks() {
      const savedTodos = ProductivityDashboard.storage.getData(
        ProductivityDashboard.config.storageKeys.todos,
      );

      if (!savedTodos) return;

      ProductivityDashboard.state.todos = savedTodos;

      this.renderTasks();
    },

    toggleTask(id) {
      const task = ProductivityDashboard.state.todos.find(
        (todo) => todo.id === id,
      );

      if (!task) return;

      task.completed = !task.completed;

      ProductivityDashboard.storage.saveData(
        ProductivityDashboard.config.storageKeys.todos,
        ProductivityDashboard.state.todos,
      );

      this.renderTasks();
    },

    completeTask(id) {
      ProductivityDashboard.state.todos =
        ProductivityDashboard.state.todos.filter((task) => task.id !== id);

      ProductivityDashboard.storage.saveData(
        ProductivityDashboard.config.storageKeys.todos,
        ProductivityDashboard.state.todos,
      );

      this.renderTasks();
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

    this.elements.panelWrapper = document.querySelector(".panel-wrapper");

    this.elements.cards = document.querySelectorAll(".card");

    this.elements.panels = document.querySelectorAll(".panel");

    this.elements.closeBtns = document.querySelectorAll(".close-btn");

    this.elements.panelOverlay = document.querySelector(".panel-overlay");

    this.elements.todo.input = document.querySelector(".todo-input");

    this.elements.todo.details = document.querySelector(".todo-details");

    this.elements.todo.important = document.querySelector(
      ".todo-important input",
    );

    this.elements.todo.submitBtn = document.querySelector(".todo-submit-btn");

    this.elements.todo.taskContainer =
      document.querySelector(".task-container");

    this.elements.todo.emptyState = document.querySelector(".empty-state");

    this.elements.todo.form = document.querySelector(".todo-form");
  },

  // =========================
  // Event Listeners
  // =========================

  bindEvents() {
    this.elements.themeBtn.addEventListener("click", () =>
      this.theme.changeTheme(),
    );
    this.elements.cards.forEach((card) => {
      card.addEventListener("click", () => {
        if (card.classList.contains("todo-card")) {
          this.panel.open("todo");
        }

        if (card.classList.contains("planner-card")) {
          this.panel.open("planner");
        }

        if (card.classList.contains("motivation-card")) {
          this.panel.open("motivation");
        }

        if (card.classList.contains("pomodoro-card")) {
          this.panel.open("pomodoro");
        }

        if (card.classList.contains("major-planner-card")) {
          this.panel.open("major-planner");
        }
      });
    });

    this.elements.closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.panel.close();
      });
    });

    this.elements.todo.submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.todo.addTask();
    });

    this.elements.todo.taskContainer.addEventListener("click", (e) => {
      const button = e.target.closest(".task-done-btn");

      if (!button) return;

      const id = Number(button.dataset.id);

      this.todo.completeTask(id);
    });
  },

  // =========================
  // Initialization
  // =========================

  init() {
    this.cacheElements();
    this.bindEvents();

    this.theme.loadTheme();
    this.clock.startClock();
    this.todo.loadTasks();

    // this.weather.startWeatherUpdates();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  ProductivityDashboard.init();
});
