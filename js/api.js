const API_URL = "https://history.muffinlabs.com";

export const fetchHistoryData = async (month, day) => {
  const res = await fetch(`${API_URL}/date/${month}/${day}`);
  if (!res.ok) throw new Error(res.statusText);
  const json = await res.json();
  return json.data;
};

// search wikipedia for a title
export const searchWikiTitle = async query => {
  const url = (
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`
  );
  const res  = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();
  const results = data.query?.search;
  if (!results || !results.length) throw new Error("No wiki results");
  return results[0].title;
};

// fetch the summary
export const fetchWikiSummary = async title => {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};