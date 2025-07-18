document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.getElementById("datePicker");
  const refreshBtn = document.getElementById("refreshBtn");
  const eventsContainer = document.getElementById("eventsContainer");

document.getElementById("sortOrder").addEventListener("change", () => {
  const selectedDate = new Date(datePicker.value);
  fetchEventsForDate(selectedDate);
});

  // Set today's date as default
  const today = new Date();
  datePicker.value = today.toISOString().substring(0, 10);

  // Load events on first load
  fetchEventsForDate(today);

  // Refresh on button click
  refreshBtn.addEventListener("click", () => {
    const selectedDate = new Date(datePicker.value);
    fetchEventsForDate(selectedDate);
  });

  function fetchEventsForDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const apiUrl = `https://history.muffinlabs.com/date/${month}/${day}`;
  const sortOrder = document.getElementById("sortOrder").value;

  eventsContainer.innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Loading historical events...</p>
    </div>
  `;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      let events = data.data.Events;
      events.sort((a, b) =>
        sortOrder === "desc" ? b.year - a.year : a.year - b.year
      );
      renderEvents(events);
    })
    .catch(error => {
      eventsContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
          Failed to load events. Please try again later.
        </div>
      `;
      console.error("API error:", error);
    });
}

  function renderEvents(events) {
    eventsContainer.innerHTML = "";

    if (events.length === 0) {
      eventsContainer.innerHTML = `
        <div class="alert alert-warning" role="alert">
          No events found for this date.
        </div>
      `;
      return;
    }

    events.forEach(event => {
      const card = document.createElement("div");
      card.classList.add("col-12");

      const wikiLink = event.links?.[0]?.link || "#";
      const cardHtml = `
        <div class="card shadow-sm event-card">
          <div class="card-body">
            <h5 class="card-title">
              <span class="badge bg-primary">${event.year}</span>
              ${event.text}
            </h5>
            <a href="${wikiLink}" target="_blank" class="btn btn-sm btn-outline-secondary">Wikipedia 🔗</a>
          </div>
        </div>
      `;

      card.innerHTML = cardHtml;
      eventsContainer.appendChild(card);
    });
  }
});