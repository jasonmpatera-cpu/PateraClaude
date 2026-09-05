import { useMemo, useState } from "react";
import { TIERS } from "../data/players.js";
import { TIER_STYLES } from "../data/tierStyles.js";
import PlayerCard from "./PlayerCard.jsx";
import { clearAll } from "../lib/collectionStorage.js";

export default function Collection({ collection, stats, onCleared }) {
  const [tierFilter, setTierFilter] = useState("all");
  const [query, setQuery] = useState("");

  const cards = useMemo(() => Object.values(collection).sort((a, b) => b.ovr - a.ovr), [collection]);

  const filtered = cards.filter((c) => {
    if (tierFilter !== "all" && c.tier !== tierFilter) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  function handleClear() {
    if (confirm("Clear your entire collection and stats? This can't be undone.")) {
      clearAll();
      onCleared();
    }
  }

  return (
    <div className="collection">
      <div className="collection__stats">
        <div className="stat-tile">
          <div className="stat-tile__value">{stats.packsOpened}</div>
          <div className="stat-tile__label">Packs Opened</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__value">{stats.cardsPulled}</div>
          <div className="stat-tile__label">Cards Pulled</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__value">{cards.length}</div>
          <div className="stat-tile__label">Unique Cards</div>
        </div>
      </div>

      <div className="collection__controls">
        <input
          className="text-input"
          placeholder="Search by player name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="text-input" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
          <option value="all">All Tiers</option>
          {TIERS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        {cards.length > 0 && (
          <button className="btn btn--ghost" onClick={handleClear}>
            Clear Collection
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="collection__empty">
          {cards.length === 0
            ? "You haven't pulled any cards yet. Go open a pack!"
            : "No cards match your filters."}
        </p>
      ) : (
        <div className="collection__grid">
          {filtered.map((card) => (
            <div key={card.id} className="collection__item">
              <PlayerCard card={card} revealed />
              <div className="collection__count" style={{ background: TIER_STYLES[card.tier].gradient }}>
                x{card.count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
