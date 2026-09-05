# NBA Pack Opener

A free, unlimited NBA card pack opening simulator inspired by NBA 2K23 MyTeam. Pick a pack, open it, and watch your cards get revealed one at a time — no cost, no limits.

The app itself lives in [`nba-pack-opener/`](nba-pack-opener/) — see that directory's README for how it's built. This root just wires up install/dev/build scripts and the GitHub Pages deploy.

## What's real vs. original here

- **Real**: player names, teams, and positions, reflecting real NBA rosters from the 2022-23 season (the NBA 2K23 era).
- **Original**: card artwork, the six-tier rating system (Bronze → Silver → Gold → Diamond → Pink Diamond → Galaxy Opal), OVR ratings, and pack odds. These are this app's own design, not scraped or copied from NBA 2K23 or MyTeam — the game's actual card art, exact ratings database, and pack branding are licensed/copyrighted and aren't reproduced here. This is a fan-made, non-commercial project with no affiliation to the NBA, NBPA, or 2K.

## Setup

Requires Node 18+.

```bash
npm run install:all
npm run dev
```

Open `http://localhost:5174`.

## Production build

```bash
npm run build     # builds nba-pack-opener/dist - a static site, deployable anywhere
npm run preview   # serve the production build locally to sanity-check it
```

Since everything runs client-side, `nba-pack-opener/dist` can be hosted on any static host (GitHub Pages, Netlify, Vercel, or just opened locally) with no backend at all. This repo auto-deploys to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

## Project structure

```
nba-pack-opener/
  src/data/players.js          Real NBA player roster (2022-23 season) tagged by tier
  src/data/packs.js            Pack definitions: odds per tier, card count, guaranteed minimums
  src/data/tierStyles.js       Visual styling per rarity tier
  src/lib/packOpener.js        Weighted-random pack opening logic
  src/lib/collectionStorage.js Browser-local collection/stats persistence
  src/components/              UI components (pack grid, opening flow, collection view)
```
