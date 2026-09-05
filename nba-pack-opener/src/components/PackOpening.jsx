import { useMemo, useState } from "react";
import { openPack } from "../lib/packOpener.js";
import PlayerCard from "./PlayerCard.jsx";
import { TIER_STYLES } from "../data/tierStyles.js";

export default function PackOpening({ pack, onFinish, onOpenAnother, onBack }) {
  const cards = useMemo(() => openPack(pack), [pack]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const isLastCard = index === cards.length - 1;

  function reveal() {
    if (!flipped) setFlipped(true);
  }

  function advance() {
    if (!flipped) {
      setFlipped(true);
      return;
    }
    if (isLastCard) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  function handleDone() {
    onFinish(cards);
  }

  return (
    <div className="pack-opening">
      <div className="pack-opening__header">
        <button className="btn btn--ghost" onClick={onBack}>
          &larr; Back to Packs
        </button>
        <h2>{pack.name}</h2>
        <div className="pack-opening__progress">
          Card {Math.min(index + 1, cards.length)} / {cards.length}
        </div>
      </div>

      <div className="pack-opening__stage">
        {!done ? (
          <div className="pack-opening__single">
            <PlayerCard key={cards[index].pullId} card={cards[index]} revealed={flipped} onClick={reveal} />
            <p className="pack-opening__hint">{flipped ? "Nice pull!" : "Tap the card to reveal it"}</p>
            <button className="btn btn--primary" onClick={advance}>
              {!flipped ? "Reveal" : isLastCard ? "See Results" : "Next Card"}
            </button>
          </div>
        ) : (
          <div className="pack-opening__summary">
            <h3>Your Pull</h3>
            <div className="pack-opening__grid">
              {cards.map((card) => (
                <div key={card.pullId} className="pack-opening__summary-card">
                  <PlayerCard card={card} revealed />
                  <div className="pack-opening__summary-tier">{TIER_STYLES[card.tier].label}</div>
                </div>
              ))}
            </div>
            <div className="pack-opening__actions">
              <button className="btn btn--primary" onClick={() => onOpenAnother(pack, cards)}>
                Open Another {pack.name}
              </button>
              <button className="btn btn--secondary" onClick={handleDone}>
                Choose a Different Pack
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
