const STORAGE_KEY = "nba-pack-opener:collection";
const STATS_KEY = "nba-pack-opener:stats";

export function loadCollection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCollection(collection) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  } catch {
    // localStorage unavailable (private browsing, quota) - collection just won't persist.
  }
}

// Adds pulled cards to the collection, keyed by player id, tracking a count per card.
export function addCardsToCollection(cards) {
  const collection = loadCollection();
  for (const card of cards) {
    if (!collection[card.id]) {
      collection[card.id] = { ...card, count: 0 };
    }
    collection[card.id].count += 1;
  }
  saveCollection(collection);
  return collection;
}

export function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { packsOpened: 0, cardsPulled: 0 };
  } catch {
    return { packsOpened: 0, cardsPulled: 0 };
  }
}

export function recordPackOpened(cardCount) {
  const stats = loadStats();
  stats.packsOpened += 1;
  stats.cardsPulled += cardCount;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
  return stats;
}

export function clearAll() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STATS_KEY);
  } catch {
    // ignore
  }
}
