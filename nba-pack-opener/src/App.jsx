import { useState } from "react";
import PackGrid from "./components/PackGrid.jsx";
import PackOpening from "./components/PackOpening.jsx";
import Collection from "./components/Collection.jsx";
import { addCardsToCollection, loadCollection, loadStats, recordPackOpened } from "./lib/collectionStorage.js";

export default function App() {
  const [view, setView] = useState("packs"); // "packs" | "opening" | "collection"
  const [activePack, setActivePack] = useState(null);
  const [collection, setCollection] = useState(() => loadCollection());
  const [stats, setStats] = useState(() => loadStats());

  function handleOpenPack(pack) {
    setActivePack(pack);
    setView("opening");
  }

  function handlePackFinished(cards) {
    setCollection(addCardsToCollection(cards));
    setStats(recordPackOpened(cards.length));
    setView("packs");
    setActivePack(null);
  }

  function handleOpenAnother(pack, cards) {
    setCollection(addCardsToCollection(cards));
    setStats(recordPackOpened(cards.length));
    setActivePack({ ...pack, _key: Math.random() });
  }

  function handleCollectionCleared() {
    setCollection({});
    setStats({ packsOpened: 0, cardsPulled: 0 });
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__title">
          <span className="app__title-ball">🏀</span>
          <h1>NBA Pack Opener</h1>
        </div>
        <nav className="app__nav">
          <button
            className={`nav-link ${view !== "collection" ? "is-active" : ""}`}
            onClick={() => setView("packs")}
          >
            Packs
          </button>
          <button
            className={`nav-link ${view === "collection" ? "is-active" : ""}`}
            onClick={() => setView("collection")}
          >
            Collection
          </button>
        </nav>
      </header>

      <main className="app__main">
        {view === "packs" && (
          <>
            <p className="app__intro">
              Every pack is free and unlimited. Real NBA players from the 2022-23 season, sorted into a
              Bronze &rarr; Galaxy Opal rarity system. Pick a pack and open it one card at a time.
            </p>
            <PackGrid onOpenPack={handleOpenPack} />
          </>
        )}

        {view === "opening" && activePack && (
          <PackOpening
            key={activePack._key ?? activePack.id}
            pack={activePack}
            onFinish={handlePackFinished}
            onOpenAnother={handleOpenAnother}
            onBack={() => {
              setView("packs");
              setActivePack(null);
            }}
          />
        )}

        {view === "collection" && (
          <Collection collection={collection} stats={stats} onCleared={handleCollectionCleared} />
        )}
      </main>

      <footer className="app__footer">
        <p>
          Fan-made, non-commercial project. Not affiliated with or endorsed by the NBA, NBPA, or 2K. Player
          names reflect real 2022-23 rosters; card art, tiers, and ratings are original.
        </p>
      </footer>
    </div>
  );
}
