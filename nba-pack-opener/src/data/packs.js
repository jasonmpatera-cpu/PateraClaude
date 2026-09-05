// Pack definitions. Every pack is free and can be opened unlimited times.
// `odds` are per-card weights across tiers (must be non-negative; don't need to sum to 100).
// `guaranteedMinTier` (optional) re-rolls the LAST card in the pack up the tier
// list until it meets or beats that tier, guaranteeing a minimum hit per pack —
// mirroring how MyTeam-style packs guarantee a floor rarity.

export const PACKS = [
  {
    id: "standard",
    name: "Standard Pack",
    tagline: "The everyday pack. Mostly Bronze and Silver, with a shot at Gold.",
    cardCount: 5,
    odds: { bronze: 60, silver: 30, gold: 9, diamond: 1 },
    color: "#8c5a2b"
  },
  {
    id: "series1",
    name: "Series 1 Pack",
    tagline: "Better balance across the board, with a real shot at a Diamond.",
    cardCount: 5,
    odds: { bronze: 35, silver: 40, gold: 20, diamond: 4.5, pinkDiamond: 0.5 },
    color: "#9aa5b1"
  },
  {
    id: "premium",
    name: "Premium Pack",
    tagline: "Silver and Gold heavy, with meaningfully better Diamond+ odds.",
    cardCount: 5,
    odds: { silver: 35, gold: 45, diamond: 16, pinkDiamond: 3.5, galaxyOpal: 0.5 },
    guaranteedMinTier: "gold",
    color: "#d4af37"
  },
  {
    id: "diamond",
    name: "Diamond Pack",
    tagline: "Guarantees at least one Diamond or better in every pack.",
    cardCount: 5,
    odds: { gold: 40, diamond: 45, pinkDiamond: 13, galaxyOpal: 2 },
    guaranteedMinTier: "diamond",
    color: "#5ec8e0"
  },
  {
    id: "pinkDiamond",
    name: "Pink Diamond Pack",
    tagline: "Every pack guarantees a Pink Diamond or better.",
    cardCount: 3,
    odds: { diamond: 30, pinkDiamond: 60, galaxyOpal: 10 },
    guaranteedMinTier: "pinkDiamond",
    color: "#ec6bb0"
  },
  {
    id: "galaxyOpal",
    name: "Galaxy Opal Pack",
    tagline: "One card. Guaranteed Galaxy Opal. As good as it gets.",
    cardCount: 1,
    odds: { galaxyOpal: 100 },
    guaranteedMinTier: "galaxyOpal",
    color: "#7b5ce8"
  }
];
