const searchInput = document.querySelector(".search__input");
const cards = document.querySelectorAll(".card");

const filterCards = (value) => {
  const query = value.trim().toLowerCase();
  cards.forEach((card) => {
    const title = card.dataset.title.toLowerCase();
    card.style.display = title.includes(query) ? "block" : "none";
  });
};

searchInput.addEventListener("input", (event) => {
  filterCards(event.target.value);
});
