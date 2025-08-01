import { setToday } from "./helpers.js";
import { saveFavorites, updateFavoritesCount } from "./localStorage.js";
import { displayEvents, displayFavorites } from "./ui.js";
import { fetchHistoryData } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.getElementById("datePicker");
  const sortOrder = document.getElementById("sortOrder");
  const refreshBtn = document.getElementById("refreshBtn");
  const randomBtn = document.getElementById("randomBtn");
  const eventsTab = document.getElementById("eventsTab");
  const birthsTab = document.getElementById("birthsTab");
  const deathsTab = document.getElementById("deathsTab");
  const favoritesTab = document.getElementById("favoritesTab");
  const controlsSection = document.getElementById("controlsSection");
  const favoritesControls = document.getElementById("favoritesControls");
  const favoritesSortEl = document.getElementById("favoritesSort");
  const clearFavsBtn = document.getElementById("clearFavoritesBtn");

  let currentCategory = "events";
  let currentEvents = [];

  const activateTab = el => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    el.classList.add("active");
  };

  const switchCategory = (cat, tabEl) => {
    currentCategory = cat;
    activateTab(tabEl);

    if (cat === "favorites") {
      controlsSection.classList.add("d-none");
      favoritesControls.classList.remove("d-none");
      displayFavorites();
    } else {
      controlsSection.classList.remove("d-none");
      favoritesControls.classList.add("d-none");
      fetchAndDisplay();
    }
  };

  const fetchAndDisplay = async () => {
    eventsContainer.innerHTML = `<p>Loading…</p>`;
    const [, m, d] = datePicker.value.split("-");
    try {
      const data = await fetchHistoryData(+m, +d);
      switch (currentCategory) {
        case "births":
          currentEvents = data.Births;
          break;
        case "deaths":
          currentEvents = data.Deaths;
          break;
        default:
          currentEvents = data.Events;
      }
      displayEvents(currentEvents);
    } catch (err) {
      console.error(err);
      eventsContainer.innerHTML = `<p class="text-danger">Failed to load ${currentCategory}.</p>`;
    }
  };

  // event listeners
  eventsTab.addEventListener("click", () => switchCategory("events", eventsTab));
  birthsTab.addEventListener("click", () => switchCategory("births", birthsTab));
  deathsTab.addEventListener("click", () => switchCategory("deaths", deathsTab));
  favoritesTab.addEventListener("click", () => switchCategory("favorites", favoritesTab));

  refreshBtn.addEventListener("click", fetchAndDisplay);
  datePicker.addEventListener("change", fetchAndDisplay);
  sortOrder.addEventListener("change", () => {
    if (currentCategory !== "favorites") displayEvents(currentEvents);
  });

  randomBtn.addEventListener("click", () => {
    if (!currentEvents.length) return;
    const idx = Math.floor(Math.random() * currentEvents.length);
    displayEvents([currentEvents[idx]]);
  });

  favoritesSortEl.addEventListener("change", displayFavorites);

  clearFavsBtn.addEventListener("click", () => {
    if (confirm("Clear all favorites?")) {
      saveFavorites([]);
      displayFavorites();
    }
  });

  // initial setup
  setToday(datePicker);
  updateFavoritesCount();
  fetchAndDisplay();
});