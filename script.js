document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://history.muffinlabs.com";
  const datePicker = document.getElementById("datePicker");
  const sortOrder = document.getElementById("sortOrder");
  const refreshBtn = document.getElementById("refreshBtn");
  const eventsContainer = document.getElementById("eventsContainer");
  const eventCount = document.getElementById("eventCount");
  const countText = document.getElementById("countText");
  
  // Navigation elements
  const eventsTab = document.getElementById("eventsTab");
  const favoritesTab = document.getElementById("favoritesTab");
  const favoritesCount = document.getElementById("favoritesCount");
  const controlsSection = document.getElementById("controlsSection");
  const favoritesControls = document.getElementById("favoritesControls");
  const favoritesSort = document.getElementById("favoritesSort");
  const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
  
  let lastEvents = [];
  let currentView = 'events'; // 'events' or 'favorites'

  // Favorites management
  const getFavorites = () => {
    const stored = localStorage.getItem('tempusToday_favorites');
    return stored ? JSON.parse(stored) : [];
  };

  const saveFavorites = (favorites) => {
    localStorage.setItem('tempusToday_favorites', JSON.stringify(favorites));
    updateFavoritesCount();
  };

  const updateFavoritesCount = () => {
    const count = getFavorites().length;
    favoritesCount.textContent = count;
    favoritesCount.style.display = count > 0 ? 'inline' : 'none';
  };

  const isFavorited = (event) => {
    const favorites = getFavorites();
    return favorites.some(fav => fav.year === event.year && fav.text === event.text);
  };

  const toggleFavorite = (event) => {
    let favorites = getFavorites();
    const isAlreadyFavorited = favorites.some(fav => fav.year === event.year && fav.text === event.text);
    
    if (isAlreadyFavorited) {
      favorites = favorites.filter(fav => !(fav.year === event.year && fav.text === event.text));
    } else {
      favorites.push({
        ...event,
        dateAdded: new Date().toISOString()
      });
    }
    
    saveFavorites(favorites);
    
    // Refresh current view
    if (currentView === 'events') {
      displayEvents(lastEvents);
    } else {
      displayFavorites();
    }
  };

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
    events.forEach((evt, index) => {
      const link = (evt.links && evt.links[0] && evt.links[0].link) || '#';
      const favorited = isFavorited(evt);
      
      const col = document.createElement('div');
      col.className = 'col-12';
      col.style.animationDelay = `${index * 0.1}s`;
      
      col.innerHTML = 
        '<div class="card event-card fade-in">' +
          '<div class="card-body">' +
            '<div class="d-flex justify-content-between align-items-start mb-2">' +
              '<span class="year-badge">' + evt.year + '</span>' +
              '<button class="favorite-btn ' + (favorited ? 'favorited' : '') + '" data-event=\'' + JSON.stringify(evt) + '\'>' +
                '<i class="fas fa-heart"></i>' +
              '</button>' +
            '</div>' +
            '<p class="event-text">' + evt.text + '</p>' +
            '<a href="' + link + '" target="_blank" class="wiki-btn">' +
              'Read More <i class="fas fa-arrow-right ms-2"></i>' +
            '</a>' +
          '</div>' +
        '</div>';
      eventsContainer.appendChild(col);
    });

    // Add event listeners for favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const eventData = JSON.parse(btn.getAttribute('data-event'));
        toggleFavorite(eventData);
      });
    });
  };

  const displayFavorites = () => {
    const favorites = getFavorites();
    const sortValue = favoritesSort.value;

    // Sort favorites based on selection
    favorites.sort((a, b) => {
      switch (sortValue) {
        case 'newest':
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'oldest':
          return new Date(a.dateAdded) - new Date(b.dateAdded);
        case 'year-desc':
          return parseYear(b.year) - parseYear(a.year);
        case 'year-asc':
          return parseYear(a.year) - parseYear(b.year);
        default:
          return 0;
      }
    });

    eventsContainer.innerHTML = '';

    if (favorites.length === 0) {
      eventsContainer.innerHTML = 
        '<div class="col-12">' +
          '<div class="empty-favorites">' +
            '<i class="fas fa-heart"></i>' +
            '<h4>No favorites yet</h4>' +
            '<p>Start exploring historical events and bookmark the ones that interest you!</p>' +
            '<button class="btn btn-primary" id="goToEventsBtn">' +
              '<i class="fas fa-calendar-day me-2"></i>Explore Events' +
            '</button>' +
          '</div>' +
        '</div>';
      
      document.getElementById('goToEventsBtn')?.addEventListener('click', () => {
        switchToEventsView();
      });
      return;
    }

    favorites.forEach((evt, index) => {
      const link = (evt.links && evt.links[0] && evt.links[0].link) || '#';
      const dateAdded = new Date(evt.dateAdded).toLocaleDateString();
      
      const col = document.createElement('div');
      col.className = 'col-12';
      col.style.animationDelay = `${index * 0.1}s`;
      
      col.innerHTML = 
        '<div class="card event-card fade-in">' +
          '<div class="card-body">' +
            '<div class="d-flex justify-content-between align-items-start mb-2">' +
              '<span class="year-badge">' + evt.year + '</span>' +
              '<div class="d-flex align-items-center gap-2">' +
                '<small class="text-muted">Added ' + dateAdded + '</small>' +
                '<button class="favorite-btn favorited" data-event=\'' + JSON.stringify(evt) + '\'>' +
                  '<i class="fas fa-heart"></i>' +
                '</button>' +
              '</div>' +
            '</div>' +
            '<p class="event-text">' + evt.text + '</p>' +
            '<a href="' + link + '" target="_blank" class="wiki-btn">' +
              'Read More <i class="fas fa-arrow-right ms-2"></i>' +
            '</a>' +
          '</div>' +
        '</div>';
      eventsContainer.appendChild(col);
    });

    // Add event listeners for favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const eventData = JSON.parse(btn.getAttribute('data-event'));
        toggleFavorite(eventData);
      });
    });
  };

  // Navigation functions
  const switchToEventsView = () => {
    currentView = 'events';
    eventsTab.classList.add('active');
    favoritesTab.classList.remove('active');
    controlsSection.classList.remove('d-none');
    favoritesControls.classList.add('d-none');
    eventCount.classList.remove('d-none');
    
    if (lastEvents.length > 0) {
      displayEvents(lastEvents);
    } else {
      fetchAndDisplay();
    }
  };

  const switchToFavoritesView = () => {
    currentView = 'favorites';
    eventsTab.classList.remove('active');
    favoritesTab.classList.add('active');
    controlsSection.classList.add('d-none');
    favoritesControls.classList.remove('d-none');
    eventCount.classList.add('d-none');
    
    displayFavorites();
  };

  // fetch and display data
  const fetchAndDisplay = () => {
    if (currentView !== 'events') return;
    
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

  // Event listeners
  eventsTab.addEventListener('click', switchToEventsView);
  favoritesTab.addEventListener('click', switchToFavoritesView);
  
  refreshBtn.addEventListener('click', fetchAndDisplay);
  datePicker.addEventListener('change', fetchAndDisplay);
  
  sortOrder.addEventListener('change', () => {
    if (lastEvents.length && currentView === 'events') displayEvents(lastEvents);
  });

  favoritesSort.addEventListener('change', () => {
    if (currentView === 'favorites') displayFavorites();
  });

  clearFavoritesBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to remove all favorites? This action cannot be undone.')) {
      saveFavorites([]);
      displayFavorites();
    }
  });

  // Initialize
  updateFavoritesCount();
  fetchAndDisplay();
});