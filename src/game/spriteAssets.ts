/**
 * Admurin full icon atlas — see README for attribution.
 * Sheet: 672×640 px → **21 columns × 20 rows** of **32×32** px cells.
 *
 * Adjust `col` / `row` (0-based, left-to-right, top-to-bottom) if an icon doesn’t match.
 */
export const ICON_ATLAS = {
  file: "Freebies_Full_Icons.png",
  width: 672,
  height: 640,
  cell: 32,
} as const;

export const ATLAS_COLS = 21;
export const ATLAS_ROWS = 20;

/**
 * Garden crops — mapped to the food / harvest section of the atlas:
 * - Row 5: fruit icons (first six slots).
 * - Row 12: pumpkins and nearby harvest icons (last four seeds).
 */
export const SEED_SPRITE_CELL: Record<string, { col: number; row: number }> = {
  carrot: { col: 0, row: 5 },
  tomato: { col: 1, row: 5 },
  sunflower: { col: 2, row: 5 },
  bean: { col: 3, row: 5 },
  eggplant: { col: 4, row: 5 },
  cucumber: { col: 5, row: 5 },
  pumpkin: { col: 0, row: 12 },
  squash: { col: 1, row: 12 },
  potato: { col: 2, row: 12 },
};

/** Fertilizers — potion bottle row in the atlas. */
export const FERTILIZER_SPRITE_CELL: Record<string, { col: number; row: number }> = {
  bounty_blend: { col: 0, row: 14 },
  miracle_mix: { col: 1, row: 14 },
};
