class Modal {
  constructor(selector) {
    this.modal = document.querySelector(selector);
    if (!this.modal) {
      throw new Error(`Modal with selector "${selector}" not found`);
    }
    this.closeBtn = this.modal.querySelector(".close-button");
    this.init();
  }

  init() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    this.modal.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.close();
      }
    });
  }

  open() {
    this.modal.classList.add("active");
    this.onOpen();
  }

  close() {
    this.modal.classList.remove("active");
    this.onClose();
  }

  toggle() {
    this.modal.classList.toggle("active");
  }

  isOpen() {
    return this.modal.classList.contains("active");
  }

  // Хуки для переопределения в подклассах
  onOpen() {}
  onClose() {}

  // Вспомогательный метод для получения контента модали
  getContent() {
    return this.modal.querySelector(".modal-content");
  }
}

export { Modal };
