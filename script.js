document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://history.muffinlabs.com";
  const datePicker = document.getElementById("datePicker");
  const sortOrder = document.getElementById("sortOrder");
  const refreshBtn = document.getElementById("refreshBtn");
  const eventsContainer = document.getElementById("eventsContainer");
  const eventCount = document.getElementById("eventCount");
  const countText = document.getElementById("countText");
  const randomBtn = document.getElementById('randomBtn');
  
  // navigation elements
  const eventsTab = document.getElementById("eventsTab");
  const favoritesTab = document.getElementById("favoritesTab");
  const birthsTab = document.getElementById("birthsTab");
  const deathsTab = document.getElementById("deathsTab");
  const favoritesCount = document.getElementById("favoritesCount");
  const controlsSection = document.getElementById("controlsSection");
  const favoritesControls = document.getElementById("favoritesControls");
  const favoritesSort = document.getElementById("favoritesSort");
  const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
  
  let currentView = "events";
  let currentCategory = "events"; 
  let currentEvents = [];

  // helpers 
  const setToday = () => {
    if (!datePicker.value) {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = ("0" + (d.getMonth() + 1)).slice(-2);
      const dd = ("0" + d.getDate()).slice(-2);
      datePicker.value = `${yyyy}-${mm}-${dd}`;
    }
  };

  const getFavorites = () => {
    const data = localStorage.getItem("favEvents");
    return data ? JSON.parse(data) : [];
  };

  const saveFavorites = (list) => {
    localStorage.setItem("favEvents", JSON.stringify(list));
    updateFavoritesCount();
  };

  const updateFavoritesCount = () => {
    const count = getFavorites().length;
    favoritesCount.textContent = count;
    favoritesCount.style.display = count > 0 ? "inline" : "none";
  };

  const isFavorited = (evt) => {
    return getFavorites().some(f => f.year === evt.year && f.text === evt.text);
  };

  const toggleFavorite = (evt) => {
    let favs = getFavorites();
    if (isFavorited(evt)) {
      favs = favs.filter(f => !(f.year === evt.year && f.text === evt.text));
    } else {
      favs.push(evt);
    }
    saveFavorites(favs);
    // update current view so hearts are updated
    currentView === "events" ? displayEvents(currentEvents) : displayFavorites();
  };

  // convert "44 BC" to -44
  const parseYear = (str) => {
    if (str.includes("BC")) {
      return -parseInt(str.replace("BC", "").trim(), 10);
    }
    const n = parseInt(str, 10);
    return isNaN(n) ? 0 : n;
  };

  // rendering functions

  const displayEvents = (events) => {
    if (currentView !== "events") return;

    // sort
    const dir = sortOrder.value === "asc" ? 1 : -1;
    const sorted = events.slice().sort((a, b) => dir * (parseYear(a.year) - parseYear(b.year)));

    // update count
    countText.textContent = `${sorted.length} event${sorted.length !== 1 ? "s" : ""} found`;
    eventCount.classList.remove("d-none");

    // build HTML
    let html = "";
    sorted.forEach((evt, idx) => {
      const isFav = isFavorited(evt);
      const heart = isFavorited(evt) ? "♥" : "♡";
      const link = (evt.links && evt.links[0]) ? evt.links[0].link : "#";
      html += `
        <div class="col-12">
            <div class="card event-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="year">${evt.year}</span>
                  <button class="favorite-btn${isFav ? " favorited" : ""}" data-index="${idx}">${heart}</button>
                </div>
                <p>${evt.text}</p>
                <a href="${link}" target="_blank">Read more</a>
              </div>
            </div>
          </div>`;
    });

    eventsContainer.innerHTML = html;

    // hearts
    document.querySelectorAll(".favorite-btn").forEach((btn, i ) => {
      btn.addEventListener("click", () => toggleFavorite(sorted[i]));
    });
  };

  const displayFavorites = () => {
    if (currentView !== "favorites") return;

    eventCount.classList.add("d-none");

    let favs = getFavorites();
    switch (favoritesSort.value) {
      case "newest":
        favs = favs.slice().reverse();
        break;
      case "year-asc":
        favs.sort((a, b) => parseYear(a.year) - parseYear(b.year));
        break;
      case "year-desc":
        favs.sort((a, b) => parseYear(b.year) - parseYear(a.year));
        break;
    }

    if (favs.length === 0) {
      eventsContainer.innerHTML = `<p>No favorites yet.</p>`;
      return;
    }

    // build more HTML
    let html = "";
    favs.forEach((evt, idx) => {
      const url = evt.links?.[0]?.link || "#";
      html += `
        <div class="col-12">
          <div class="card event-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="year">${evt.year}</span>
                <button class="favorite-btn favorited" data-index="${idx}">♥</button>
              </div>
              <p>${evt.text}</p>
              <a href="${url}" target="_blank">Read more</a>
            </div>
          </div>
        </div>`;
    });

    eventsContainer.innerHTML = html;

    document.querySelectorAll(".favorite-btn").forEach((btn, i) => {
      btn.addEventListener("click", () => toggleFavorite(favs[i]));
    });
  };

  // tab switching helper

  const switchCategory = (cat, tabEl) => {
    currentView     = "events"; 
    currentCategory = cat;
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    tabEl.classList.add("active");
    controlsSection.classList.toggle("d-none", false);
    favoritesControls.classList.add("d-none");
    eventCount.classList.toggle("d-none", false);
    fetchAndDisplay();
  };


  // fetching data

  const fetchAndDisplay = async () => {
    if (currentView !== "events") return;
    eventsContainer.innerHTML = `<p>Loading…</p>`;
    const [ , month, day ] = datePicker.value.split("-");
    try {
      const res  = await fetch(`${API_URL}/date/${+month}/${+day}`);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      
      const { Events, Births, Deaths, Holidays } = json.data;
    
      switch (currentCategory) {
        case "births":   currentEvents = Births;   break;
        case "deaths":   currentEvents = Deaths;   break;
        default:         currentEvents = Events;
      }
      displayEvents(currentEvents);
    } catch (err) {
      console.error(err);
      eventsContainer.innerHTML = `
        <p class="text-danger">
          Failed to load ${currentCategory}.
        </p>
      `;
    }
  };

  // tab & controls handling
  // daily events tab
  eventsTab.addEventListener("click", () => switchCategory("events", eventsTab));

  // favorites tab
  favoritesTab.addEventListener("click", () => {
    document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
    favoritesTab.classList.add("active");
    currentView = "favorites";
    controlsSection.classList.add("d-none");
    favoritesControls.classList.remove("d-none");
    displayFavorites();
  });

  // births tab
  birthsTab.addEventListener("click", () => switchCategory("births", birthsTab));

  // deaths tab
  deathsTab.addEventListener("click", () => switchCategory("deaths", deathsTab));

    // other controls
    refreshBtn.addEventListener("click", fetchAndDisplay);
    randomBtn.addEventListener('click', () => {
      if (!currentEvents || currentEvents.length === 0) return;
      // random index from currentEvents array
      const idx     = Math.floor(Math.random() * currentEvents.length);
      const randEvt = currentEvents[idx];
      // re-render just that one event
      displayEvents([randEvt]);
    });
    datePicker.addEventListener("change", fetchAndDisplay);
    sortOrder.addEventListener("change", () => displayEvents(currentEvents));
    favoritesSort.addEventListener("change", displayFavorites);
    clearFavoritesBtn.addEventListener("click", () => {
      if (confirm("Clear all favorites?")) {
        saveFavorites([]);
        displayFavorites();
      }
    });

    // initial setup
    setToday();
    updateFavoritesCount();
    fetchAndDisplay();
});