import { PACKS } from "../data/packs.js";
import { TIER_STYLES } from "../data/tierStyles.js";

function OddsBar({ odds }) {
  const total = Object.values(odds).reduce((a, b) => a + b, 0);
  return (
    <div className="odds-bar">
      {Object.entries(odds).map(([tierId, weight]) => (
        <div
          key={tierId}
          className="odds-bar__segment"
          style={{ width: `${(weight / total) * 100}%`, background: TIER_STYLES[tierId].gradient }}
          title={`${TIER_STYLES[tierId].label}: ${((weight / total) * 100).toFixed(1)}%`}
        />
      ))}
    </div>
  );
}

export default function PackGrid({ onOpenPack }) {
  return (
    <div className="pack-grid">
      {PACKS.map((pack) => (
        <div className="pack-tile" key={pack.id} style={{ "--pack-color": pack.color }}>
          <div className="pack-tile__art">
            <span className="pack-tile__icon">🏀</span>
          </div>
          <h3 className="pack-tile__name">{pack.name}</h3>
          <p className="pack-tile__tagline">{pack.tagline}</p>
          <OddsBar odds={pack.odds} />
          <div className="pack-tile__footer">
            <span className="pack-tile__count">{pack.cardCount} card{pack.cardCount > 1 ? "s" : ""}</span>
            <span className="pack-tile__price">FREE</span>
          </div>
          <button className="btn btn--primary" onClick={() => onOpenPack(pack)}>
            Open Pack
          </button>
        </div>
      ))}
    </div>
  );
}
