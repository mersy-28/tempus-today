const KEY = "favEvents";

export const getFavorites = () => {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const updateFavoritesCount = () => {
  const count = getFavorites().length;
  const el = document.getElementById("favoritesCount");
  el.textContent = count;
  el.style.display = count > 0 ? "inline" : "none";
};

export const saveFavorites = list => {
  localStorage.setItem(KEY, JSON.stringify(list));
  updateFavoritesCount();
};

export const isFavorited = evt =>
  getFavorites().some(f => f.year === evt.year && f.text === evt.text);

export const toggleFavorite = evt => {
  let favs = getFavorites();
  favs = isFavorited(evt)
    ? favs.filter(f => !(f.year === evt.year && f.text === evt.text))
    : [...favs, evt];
  saveFavorites(favs);
  return favs;
};