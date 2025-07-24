document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://history.muffinlabs.com";
  const datePicker = document.getElementById("datePicker");
  const sortOrder = document.getElementById("sortOrder");
  const refreshBtn = document.getElementById("refreshBtn");
  const eventsContainer = document.getElementById("eventsContainer");
  const eventCount = document.getElementById("eventCount");
  const countText = document.getElementById("countText");
  let lastEvents = [];

  // initialize date picker to today
  if (!datePicker.value) {
    const today = new Date();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;
    datePicker.value = today.getFullYear() + '-' + mm + '-' + dd;
  }

  // loading spinner
  const showLoading = () => {
    eventCount.classList.add('d-none');
    eventsContainer.innerHTML = 
      '<div class="col-12">' +
        '<div class="loading-container">' +
          '<div class="spinner-border" role="status">' +
            '<span class="visually-hidden">Loading...</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  };

  // parse year strings to integers
  const parseYear = yearStr => {
    const bcMatch = yearStr.match(/(\d+)\s*BC$/i);
    if (bcMatch) return -parseInt(bcMatch[1], 10);
    const num = parseInt(yearStr, 10);
    return isNaN(num) ? 0 : num;
  };

  // render events & update count
  const displayEvents = events => {
    const dir = sortOrder.value === 'asc' ? 1 : -1;
    events.sort((a, b) => dir * (parseYear(a.year) - parseYear(b.year)));

    countText.textContent = 
      events.length + ' event' + (events.length !== 1 ? 's' : '') + ' found';
    eventCount.classList.remove('d-none');

    eventsContainer.innerHTML = '';
    events.forEach(evt => {
      const link = (evt.links && evt.links[0] && evt.links[0].link) || '#';
      const col = document.createElement('div');
      col.className = 'col-12';
      col.innerHTML = 
        '<div class="card event-card fade-in">' +
          '<div class="card-body">' +
            '<span class="year-badge">' + evt.year + '</span>' +
            '<p class="event-text">' + evt.text + '</p>' +
            '<a href="' + link + '" target="_blank" class="wiki-btn">' +
              'Read More <i class="fas fa-arrow-right ms-2"></i>' +
            '</a>' +
          '</div>' +
        '</div>';
      eventsContainer.appendChild(col);
    });
  };

  // fetch and display data
  const fetchAndDisplay = () => {
    showLoading();
    const [ , month, day ] = datePicker.value.split('-');

    fetch(API_URL + '/date/' + parseInt(month, 10) + '/' + parseInt(day, 10))
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(json => {
        lastEvents = json.data.Events;
        displayEvents(lastEvents);
      })
      .catch(err => {
        eventsContainer.innerHTML = 
          '<div class="col-12">' +
            '<div class="alert alert-danger">' +
              'Failed to load events. Please try again later.' +
            '</div>' +
          '</div>';
        console.error(err);
      });
  };

  // controls
  refreshBtn.addEventListener('click', fetchAndDisplay);
  datePicker.addEventListener('change', fetchAndDisplay);
  sortOrder.addEventListener('change', () => {
    if (lastEvents.length) displayEvents(lastEvents);
  });

  // initial fetch
  fetchAndDisplay();
});