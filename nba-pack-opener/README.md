# NBA Pack Opener

A free, unlimited NBA card pack opening simulator inspired by NBA 2K23 MyTeam. Pick a pack, open it, and watch your cards get revealed one at a time — no cost, no limits.

## What's real vs. original here

- **Real**: player names, teams, and positions, reflecting real NBA rosters from the 2022-23 season (the NBA 2K23 era).
- **Original**: card artwork, the six-tier rating system (Bronze → Silver → Gold → Diamond → Pink Diamond → Galaxy Opal), OVR ratings, and pack odds. These are this app's own design, not scraped or copied from NBA 2K23 or MyTeam — the game's actual card art, exact ratings database, and pack branding are licensed/copyrighted and aren't reproduced here. This is a fan-made, non-commercial project with no affiliation to the NBA, NBPA, or 2K.

## How it works

- **Packs** (`src/data/packs.js`) — six pack types, each free and reopenable infinitely, with per-tier pull odds and (for most) a guaranteed minimum tier per pack.
- **Players** (`src/data/players.js`) — ~120 real players tagged with a tier and OVR.
- **Opening a pack** (`src/lib/packOpener.js`) draws `cardCount` cards by weighted random tier, then a random player from that tier, enforcing any guaranteed-minimum-tier rule.
- **Reveal flow** (`src/components/PackOpening.jsx`) shows one face-down card at a time; click/tap to flip it, then advance to the next, ending in a pull summary.
- **Collection** (`src/components/Collection.jsx`, `src/lib/collectionStorage.js`) — every card you've ever pulled persists in the browser's `localStorage`, with duplicate counts, search, and tier filtering. Nothing is sent to a server.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5174`.

## Production build

```bash
npm run build     # builds dist/ - a static site, deployable anywhere
npm run preview   # serve the production build locally
```

Everything runs client-side with no backend, so `dist/` can be hosted on any static host.
