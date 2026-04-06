import type { PlantedCell } from "./types";

/** Definition of a seed type: economy + how it interacts with other plants. */
export interface SeedDefinition {
  id: string;
  name: string;
  /** Player-facing explanation of flavor and grid effects */
  description: string;
  /** CSS color for UI / grid */
  color: string;
  growDurationMs: number;
  sellPrice: number;
  /** Cost per seed in the shop (after species is unlocked) */
  shopPrice: number;
  /**
   * One-time coins to add this species to your roster (shop). Omitted for free starter crops.
   */
  unlockShopPrice?: number;
  /** Bonus growth rate to orthogonal neighbors (additive), e.g. 0.1 = +10% speed */
  orthoNeighborGrowthBonus?: number;
  /** Manhattan radius aura: bonus growth per tick to others in range (excluding self) */
  aura?: { radius: number; growthBonus: number };
  /** When an orthogonal neighbor matures, add this much progress to this plant */
  chainMatureProgress?: number;
  /** Multiplier applied to orthogonal neighbors' growth (e.g. 0.94 = slows them) */
  orthoNeighborGrowthMult?: number;
}

/** Free at game start — all others must be unlocked in the shop or via events. */
export const STARTER_UNLOCKED_SEED_IDS: readonly string[] = ["carrot", "tomato", "sunflower"];

export const SEED_ORDER: readonly string[] = [
  "carrot",
  "tomato",
  "sunflower",
  "bean",
  "pumpkin",
  "eggplant",
  "cucumber",
  "squash",
  "potato",
];

export const SEEDS: Record<string, SeedDefinition> = {
  carrot: {
    id: "carrot",
    name: "Squash",
    description:
      "A sturdy squash for filling plots. Grows at a steady pace with no special grid effects—good for learning the ropes.",
    color: "#e67e22",
    growDurationMs: 1_000,
    sellPrice: 8,
    shopPrice: 2,
  },
  tomato: {
    id: "tomato",
    name: "Apple",
    description:
      "Crisp orchard energy. Each apple tree nudges plants in the four tiles next to it to grow a little faster.",
    color: "#c0392b",
    growDurationMs: 2_000,
    sellPrice: 14,
    shopPrice: 20,
    orthoNeighborGrowthBonus: 0.12,
  },
  sunflower: {
    id: "sunflower",
    name: "Orange",
    description:
      "Sun-bright citrus. Other plants within two steps (Manhattan distance) catch a little extra warmth and grow faster.",
    color: "#f1c40f",
    growDurationMs: 2_000,
    sellPrice: 16,
    shopPrice: 22,
    aura: { radius: 2, growthBonus: 0.06 },
  },
  bean: {
    id: "bean",
    name: "Pear",
    description:
      "Branching and patient. When a plant directly next to a pear finishes growing, the pear gets a burst of progress—chains can cascade.",
    color: "#27ae60",
    growDurationMs: 2_000,
    sellPrice: 12,
    shopPrice: 18,
    unlockShopPrice: 85,
    chainMatureProgress: 0.18,
  },
  pumpkin: {
    id: "pumpkin",
    name: "Cherry",
    description:
      "Dense and demanding. Slows plants directly next to it, but sells for a premium—place with care.",
    color: "#d35400",
    growDurationMs: 2_000,
    sellPrice: 28,
    shopPrice: 40,
    unlockShopPrice: 110,
    orthoNeighborGrowthMult: 0.88,
  },
  eggplant: {
    id: "eggplant",
    name: "Peach",
    description:
      "Soft color, steady help. Gives a modest boost to orthogonal neighbors—lighter touch than an apple, great in tight rows.",
    color: "#6c3483",
    growDurationMs: 2_200,
    sellPrice: 18,
    shopPrice: 24,
    unlockShopPrice: 95,
    orthoNeighborGrowthBonus: 0.08,
  },
  cucumber: {
    id: "cucumber",
    name: "Snotfruit",
    description:
      "A… distinctive cultivar. Grows fast and gives neighbors a slimy little nudge—perfect for racing the season.",
    color: "#58d68d",
    growDurationMs: 1_800,
    sellPrice: 11,
    shopPrice: 16,
    unlockShopPrice: 88,
    orthoNeighborGrowthBonus: 0.06,
  },
  squash: {
    id: "squash",
    name: "Tangerine",
    description:
      "Bold and a bit heavy. Neighboring plants grow a bit slower, but the harvest pays well.",
    color: "#f39c12",
    growDurationMs: 2_400,
    sellPrice: 22,
    shopPrice: 30,
    unlockShopPrice: 102,
    orthoNeighborGrowthMult: 0.93,
  },
  potato: {
    id: "potato",
    name: "Pumpkin",
    description:
      "Honest gourd energy. No fancy grid tricks—just a fast cycle and solid coins for reliable plots.",
    color: "#a569bd",
    growDurationMs: 1_500,
    sellPrice: 9,
    shopPrice: 14,
    unlockShopPrice: 82,
  },
};

export function getSeed(id: string): SeedDefinition {
  const s = SEEDS[id];
  if (!s) throw new Error(`Unknown seed: ${id}`);
  return s;
}

/** True if this species is free at the start of a new year (not shop-locked). */
export function isStarterUnlockedSeed(id: string): boolean {
  return STARTER_UNLOCKED_SEED_IDS.includes(id);
}

/** Initial unlock map: starters true, all others false. */
export function createInitialUnlockedSeeds(): Record<string, boolean> {
  const u: Record<string, boolean> = {};
  for (const id of SEED_ORDER) {
    u[id] = isStarterUnlockedSeed(id);
  }
  return u;
}

/** Random starter pick — only from crops unlocked at game start. */
export function pickRandomStarterSeedId(): string {
  const pool = SEED_ORDER.filter((id) => isStarterUnlockedSeed(id));
  const i = Math.floor(Math.random() * pool.length);
  return pool[i]!;
}

/** Manhattan distance on grid */
export function manhattan(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

/**
 * Growth speed multiplier for plant at (r,c) from other plants' effects.
 * Does not include chain bursts (handled on mature events).
 */
export function growthMultiplierAt(
  grid: (PlantedCell | null)[][],
  r: number,
  c: number,
): number {
  let add = 0;
  let mult = 1;

  for (let rr = 0; rr < grid.length; rr++) {
    for (let cc = 0; cc < grid[rr].length; cc++) {
      if (rr === r && cc === c) continue;
      const cell = grid[rr][cc];
      if (!cell) continue;
      const def = SEEDS[cell.seedId];
      if (!def) continue;

      const dist = manhattan(r, c, rr, cc);
      const ortho = dist === 1;

      if (ortho && def.orthoNeighborGrowthBonus) {
        add += def.orthoNeighborGrowthBonus;
      }
      if (ortho && def.orthoNeighborGrowthMult !== undefined) {
        mult *= def.orthoNeighborGrowthMult;
      }
      if (def.aura && dist >= 1 && dist <= def.aura.radius) {
        add += def.aura.growthBonus;
      }
    }
  }

  const raw = (1 + add) * mult;
  return Math.min(3, Math.max(0.25, raw));
}
