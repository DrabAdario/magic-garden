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
  /** Cost per seed in the shop */
  shopPrice: number;
  /** Bonus growth rate to orthogonal neighbors (additive), e.g. 0.1 = +10% speed */
  orthoNeighborGrowthBonus?: number;
  /** Manhattan radius aura: bonus growth per tick to others in range (excluding self) */
  aura?: { radius: number; growthBonus: number };
  /** When an orthogonal neighbor matures, add this much progress to this plant */
  chainMatureProgress?: number;
  /** Multiplier applied to orthogonal neighbors' growth (e.g. 0.94 = slows them) */
  orthoNeighborGrowthMult?: number;
}

export const SEED_ORDER: readonly string[] = [
  "carrot",
  "tomato",
  "sunflower",
  "bean",
  "pumpkin",
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
    orthoNeighborGrowthMult: 0.88,
  },
};

export function getSeed(id: string): SeedDefinition {
  const s = SEEDS[id];
  if (!s) throw new Error(`Unknown seed: ${id}`);
  return s;
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
      if (ortho && cell.seedId === "pumpkin" && def.orthoNeighborGrowthMult !== undefined) {
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
