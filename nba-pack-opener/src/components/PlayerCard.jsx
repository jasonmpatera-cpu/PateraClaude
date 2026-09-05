import { TIER_STYLES } from "../data/tierStyles.js";

function initials(name) {
  return name
    .split(" ")
    .filter((w) => /[A-Za-z]/.test(w[0]))
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export default function PlayerCard({ card, revealed, onClick, size = "normal" }) {
  const style = TIER_STYLES[card.tier];
  const sizeClass = size === "large" ? "player-card--large" : "";

  return (
    <div
      className={`player-card-flip ${sizeClass} ${revealed ? "is-revealed" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="player-card-flip__inner">
        <div className="player-card-face player-card-face--back">
          <div className="player-card-face__logo">🏀</div>
        </div>
        <div
          className={`player-card-face player-card-face--front ${style.animated ? "is-animated-foil" : ""}`}
          style={{ background: style.gradient, color: style.text, boxShadow: `0 0 32px ${style.glow}` }}
        >
          <div className="player-card__tier">{style.label}</div>
          <div className="player-card__avatar">{initials(card.name)}</div>
          <div className="player-card__ovr">{card.ovr}</div>
          <div className="player-card__name">{card.name}</div>
          <div className="player-card__meta">
            {card.pos} &middot; {card.team}
          </div>
        </div>
      </div>
    </div>
  );
}
