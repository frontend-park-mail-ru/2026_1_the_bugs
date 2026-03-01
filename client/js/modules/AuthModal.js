import { Modal } from "./Modal.js";

class AuthModal extends Modal {
  constructor(selector) {
    super(selector);
    this.isLoginMode = true; // true = login, false = register
    this.isLoading = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const content = this.getContent();
    
    // Переключение между формами
    const toggleBtn = content.querySelector(".auth-toggle-btn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggleMode());
    }

    // Форма авторизации
    const loginForm = content.querySelector("#loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // Форма регистрации
    const registerForm = content.querySelector("#registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.renderForms();
  }

  renderForms() {
    const content = this.getContent();
    const loginForm = content.querySelector("#loginForm");
    const registerForm = content.querySelector("#registerForm");
    const title = content.querySelector(".auth-title");
    const toggleBtn = content.querySelector(".auth-toggle-btn");

    if (this.isLoginMode) {
      loginForm.style.display = "block";
      registerForm.style.display = "none";
      if (title) title.textContent = "Авторизация";
      if (toggleBtn) toggleBtn.textContent = "Создать аккаунт";
    } else {
      loginForm.style.display = "none";
      registerForm.style.display = "block";
      if (title) title.textContent = "Регистрация";
      if (toggleBtn) toggleBtn.textContent = "Вернуться к входу";
    }
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    const content = this.getContent();
    const submitBtn = content.querySelector(".auth-btn");
    
    if (submitBtn) {
      submitBtn.disabled = isLoading;
      submitBtn.textContent = isLoading ? "Загрузка..." : 
        (this.isLoginMode ? "Войти" : "Создать аккаунт");
    }
  }

  async handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;

    this.setLoading(true);

    try {
      // TODO: Отправить данные на сервер
      // const response = await apiService.post('/auth/login', { email, password });
      // if (response.token) {
      //   apiService.setToken(response.token);
      //   this.close();
      // }

      console.log("Login attempt:", { email, password });
      alert("Успешно вошли! (демо)");
      this.close();
    } catch (error) {
      console.error("Login error:", error);
      alert("Ошибка входа: " + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const confirmPassword = form.querySelector('input[name="confirmPassword"]').value;

    if (password !== confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }

    this.setLoading(true);

    try {
      // TODO: Отправить данные на сервер
      // const response = await apiService.post('/auth/register', { email, password });
      // if (response.token) {
      //   apiService.setToken(response.token);
      //   this.close();
      // }

      console.log("Register attempt:", { email, password });
      alert("Аккаунт создан! (демо)");
      this.close();
    } catch (error) {
      console.error("Register error:", error);
      alert("Ошибка регистрации: " + error.message);
    } finally {
      this.setLoading(false);
    }
  }

  onOpen() {
    // Очистить формы при открытии
    const content = this.getContent();
    const forms = content.querySelectorAll("form");
    forms.forEach(form => form.reset());
    
    // Убедиться что показывается форма логина
    this.isLoginMode = true;
    this.renderForms();
  }

  onClose() {
    // Очистить состояние при закрытии
    const content = this.getContent();
    const forms = content.querySelectorAll("form");
    forms.forEach(form => form.reset());
    this.setLoading(false);
  }
}

export { AuthModal };
