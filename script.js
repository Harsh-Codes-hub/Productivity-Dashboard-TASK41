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
  },

  // =========================
  // Config
  // =========================

  config: {
    themes: ["theme-1", "theme-2", "theme-3", "theme-4", "theme-5"],

    storageKeys: {
      theme: "productivity-theme",
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

    this.bindEvents();
  },
};

document.addEventListener("DOMContentLoaded", () => {
  ProductivityDashboard.init();
});
