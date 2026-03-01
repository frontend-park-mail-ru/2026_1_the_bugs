import { AuthModal } from "./modules/AuthModal.js";

class App {
  constructor() {
    this.initModules();
    this.setupEventListeners();
  }

  initModules() {
    // Инициализируем модальное окно авторизации
    this.authModal = new AuthModal("#myModal");
  }

  setupEventListeners() {
    // Кнопка профиля открывает модаль авторизации
    const profileBtn = document.getElementById("openAuth");
    if (profileBtn) {
      profileBtn.addEventListener("click", () => {
        this.authModal.open();
      });
    }
  }
}

// Инициализируем приложение когда DOM загружен
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
