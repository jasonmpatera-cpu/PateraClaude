import { TIERS, playersByTier } from "../data/players.js";

const TIER_ORDER = TIERS.map((t) => t.id);

function tierIndex(tierId) {
  return TIER_ORDER.indexOf(tierId);
}

function weightedRandomTier(odds) {
  const entries = Object.entries(odds).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [tierId, weight] of entries) {
    if (roll < weight) return tierId;
    roll -= weight;
  }
  return entries[entries.length - 1][0];
}

function randomPlayerFromTier(tierId) {
  const pool = playersByTier(tierId);
  return pool[Math.floor(Math.random() * pool.length)];
}

function drawCard(odds) {
  const tierId = weightedRandomTier(odds);
  return randomPlayerFromTier(tierId);
}

// Opens a pack and returns an array of player-card objects (with a fresh
// `pullId` per pull so the same player pulled twice renders as distinct cards).
export function openPack(pack) {
  const cards = [];
  for (let i = 0; i < pack.cardCount; i++) {
    cards.push(drawCard(pack.odds));
  }

  if (pack.guaranteedMinTier) {
    const minIdx = tierIndex(pack.guaranteedMinTier);
    const meetsFloor = cards.some((c) => tierIndex(c.tier) >= minIdx);
    if (!meetsFloor) {
      cards[cards.length - 1] = randomPlayerFromTier(pack.guaranteedMinTier);
    }
  }

  return cards.map((card, i) => ({ ...card, pullId: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}` }));
}
