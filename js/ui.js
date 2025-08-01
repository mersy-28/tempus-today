import { parseYear } from "./helpers.js";
import { isFavorited, toggleFavorite, getFavorites } from "./localStorage.js";
import { searchWikiTitle, fetchWikiSummary } from "./api.js";

const datePicker = document.getElementById("datePicker");
const sortOrder = document.getElementById("sortOrder");
const eventsContainer = document.getElementById("eventsContainer");
const eventCount = document.getElementById("eventCount");
const countText = document.getElementById("countText");
const favoritesSort = document.getElementById("favoritesSort");

// bind the heart buttons 
const bindFavoriteButtons = (events, displayFn) => {
  document.querySelectorAll(".favorite-btn").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      toggleFavorite(events[i]);
      displayFn(events);
    });
  });
};

// bind the learn more buttons
export const bindWikiButtons = events => {
  document.querySelectorAll(".wiki-btn").forEach((btn, idx) => {
    btn.addEventListener("click", async () => {
      const evt = events[idx];
      const summaryEl = document.getElementById(`summary-${idx}`);

      if (!summaryEl.dataset.loaded) {
        // 1) grab the History API’s own wiki link
        const pageUrl = evt.links?.[0]?.link;
        if (!pageUrl) {
          summaryEl.textContent = "No Wikipedia link available.";
        } else {
          // 2) derive the title from the URL’s last segment
          const title = decodeURIComponent(pageUrl.split("/").pop());

          try {
            // 3) fetch the REST summary for that exact page
            const data = await fetchWikiSummary(title);

            // 4) inject the first paragraph (HTML if available)
            const paragraph = data.extract_html
              ? data.extract_html
              : `<p>${data.extract}</p>`;

            summaryEl.innerHTML = `
              ${paragraph}
              <p>
                <a href="${pageUrl}" target="_blank">
                  Read more on Wikipedia
                </a>
              </p>
            `;
          } catch (err) {
            console.error("Wiki summary error:", err);
            summaryEl.textContent = "Summary not available.";
          }
        }

        summaryEl.dataset.loaded = "true";
      }

      // toggle visibility
      summaryEl.classList.toggle("d-none");
    });
  });
};

// display events, births, deaths
export const displayEvents = events => {
  const [, m, d] = datePicker.value.split("-");
  const monthIndex = parseInt(m,10) - 1;
  const dayNumber = parseInt(d,10);
  const dir = sortOrder.value === "asc" ? 1 : -1;

  const sorted = events
    .slice()
    .sort((a,b) => dir * (parseYear(a.year) - parseYear(b.year)));

  countText.textContent = `${sorted.length} event${sorted.length !== 1 ? "s" : ""} found`;
  eventCount.classList.remove("d-none");

  let html = "";
  sorted.forEach((evt, idx) => {
    const dt = new Date(parseInt(evt.year,10), monthIndex, dayNumber)
      .toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" });
    const fav = isFavorited(evt);
    html += `
      <div class="col-12">
        <div class="card event-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="year">${dt}</span>
              <button class="favorite-btn${fav ? " favorited" : ""}" data-index="${idx}">
                ${fav ? "♥" : "♡"}
              </button>
            </div>
            <p>${evt.text}</p>
            <button class="wiki-btn btn btn-sm mt-2" data-index="${idx}">
              <i class="fas fa-info-circle"></i> Learn More
            </button>
            <div class="wiki-summary mt-2 d-none" id="summary-${idx}">Loading…</div>
          </div>
        </div>
      </div>`;
  });

  eventsContainer.innerHTML = html;
  bindWikiButtons(sorted);
  bindFavoriteButtons(sorted, displayEvents);
};

// display the favorites tab
export const displayFavorites = () => {
  eventCount.classList.add("d-none");

  let favs = getFavorites();
  switch (favoritesSort.value) {
    case "newest":
      favs = favs.slice().reverse();
      break;
    case "year-asc":
      favs = favs.slice().sort((a,b) => parseYear(a.year) - parseYear(b.year));
      break;
    case "year-desc":
      favs = favs.slice().sort((a,b) => parseYear(b.year) - parseYear(a.year));
      break;
  }

  if (!favs.length) {
    eventsContainer.innerHTML = `<p>No favorites yet.</p>`;
    return;
  }

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
            <a href="${url}" target="_blank">Wikipedia</a>
          </div>
        </div>
      </div>`;
  });

  eventsContainer.innerHTML = html;
  bindWikiButtons(sorted);
  bindFavoriteButtons(sorted, displayEvents);
  document.querySelectorAll(".favorite-btn").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      toggleFavorite(favs[i]);
      displayFavorites();
    });
  });
};