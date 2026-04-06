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
  "sweet_potato",
];

export const SEEDS: Record<string, SeedDefinition> = {
  carrot: {
    id: "carrot",
    name: "Carrot",
    description:
      "A reliable root crop. Grows at a steady pace with no special grid effects—use it to fill space or learn the basics.",
    color: "#e67e22",
    growDurationMs: 1_000,
    sellPrice: 8,
    shopPrice: 2,
  },
  tomato: {
    id: "tomato",
    name: "Tomato",
    description:
      "Vines that share the wealth. Each tomato speeds up plants in the four tiles directly next to it (up, down, left, right).",
    color: "#c0392b",
    growDurationMs: 2_000,
    sellPrice: 14,
    shopPrice: 20,
    orthoNeighborGrowthBonus: 0.12,
  },
  sunflower: {
    id: "sunflower",
    name: "Sunflower",
    description:
      "Soaks up sunlight and shares it. Other plants within two steps (Manhattan distance) grow a bit faster—great for clustered gardens.",
    color: "#f1c40f",
    growDurationMs: 2_000,
    sellPrice: 16,
    shopPrice: 22,
    aura: { radius: 2, growthBonus: 0.06 },
  },
  bean: {
    id: "bean",
    name: "Bean",
    description:
      "Climbs when neighbors finish. When a plant directly next to a bean finishes growing, the bean gets a burst of progress—chains can cascade.",
    color: "#27ae60",
    growDurationMs: 2_000,
    sellPrice: 12,
    shopPrice: 18,
    unlockShopPrice: 85,
    chainMatureProgress: 0.18,
  },
  pumpkin: {
    id: "pumpkin",
    name: "Pumpkin",
    description:
      "Heavy and hungry for space. Slows plants directly next to it, but harvests for a high price—place with care.",
    color: "#d35400",
    growDurationMs: 2_000,
    sellPrice: 28,
    shopPrice: 40,
    unlockShopPrice: 110,
    orthoNeighborGrowthMult: 0.88,
  },
  eggplant: {
    id: "eggplant",
    name: "Eggplant",
    description:
      "Deep purple and patient. Gives a modest boost to orthogonal neighbors—lighter touch than a tomato, steady in tight rows.",
    color: "#6c3483",
    growDurationMs: 2_200,
    sellPrice: 18,
    shopPrice: 24,
    unlockShopPrice: 95,
    orthoNeighborGrowthBonus: 0.08,
  },
  cucumber: {
    id: "cucumber",
    name: "Cucumber",
    description:
      "Quick-climbing vines. Grows fast and nudges neighbors along—good for filling edges and racing the season.",
    color: "#58d68d",
    growDurationMs: 1_800,
    sellPrice: 11,
    shopPrice: 16,
    unlockShopPrice: 88,
    orthoNeighborGrowthBonus: 0.06,
  },
  squash: {
    id: "squash",
    name: "Squash",
    description:
      "Spreading and heavy. Neighboring plants grow a bit slower, but the harvest pays well—like a gentler pumpkin.",
    color: "#f39c12",
    growDurationMs: 2_400,
    sellPrice: 22,
    shopPrice: 30,
    unlockShopPrice: 102,
    orthoNeighborGrowthMult: 0.93,
  },
  potato: {
    id: "potato",
    name: "Potato",
    description:
      "Understated tuber. No fancy grid tricks—just a fast cycle and solid coins for reliable plots.",
    color: "#a569bd",
    growDurationMs: 1_500,
    sellPrice: 9,
    shopPrice: 14,
    unlockShopPrice: 82,
  },
  sweet_potato: {
    id: "sweet_potato",
    name: "Sweet potato",
    description:
      "Stores energy below ground and shares a little sun: plants one step away get a tiny growth bump.",
    color: "#e59866",
    growDurationMs: 2_000,
    sellPrice: 15,
    shopPrice: 21,
    unlockShopPrice: 100,
    aura: { radius: 1, growthBonus: 0.05 },
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
