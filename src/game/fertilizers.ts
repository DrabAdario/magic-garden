/** Soil additives bought in the shop and applied to a growing plant (one per tile per crop). */

export interface FertilizerDefinition {
  id: string;
  name: string;
  description: string;
  /** CSS color for UI */
  color: string;
  shopPrice: number;
  /** Multiplier on growth progress each tick (default 1) */
  growthSpeedMult?: number;
  /** Extra units of crop added to the bag when this plant is harvested */
  harvestExtraCount?: number;
}

export const FERTILIZER_ORDER: readonly string[] = ["sprout_rush", "bounty_blend", "miracle_mix"];

export const FERTILIZERS: Record<string, FertilizerDefinition> = {
  sprout_rush: {
    id: "sprout_rush",
    name: "Sprout Rush",
    description:
      "Fast-release nitrogen. The plant grows noticeably faster until you harvest it.",
    color: "#5dade2",
    shopPrice: 14,
    growthSpeedMult: 1.35,
  },
  bounty_blend: {
    id: "bounty_blend",
    name: "Bounty Blend",
    description:
      "Phosphorus-heavy mix. Does not change growth speed, but you pick extra produce when the crop is ready.",
    color: "#af7ac5",
    shopPrice: 22,
    harvestExtraCount: 1,
  },
  miracle_mix: {
    id: "miracle_mix",
    name: "Miracle Mix",
    description:
      "Premium all-in-one: a modest growth boost and one extra crop at harvest.",
    color: "#48c9b0",
    shopPrice: 40,
    growthSpeedMult: 1.18,
    harvestExtraCount: 1,
  },
};

export function getFertilizer(id: string): FertilizerDefinition {
  const f = FERTILIZERS[id];
  if (!f) throw new Error(`Unknown fertilizer: ${id}`);
  return f;
}

export function fertilizerGrowthMult(fertilizerId: string | undefined): number {
  if (!fertilizerId) return 1;
  const f = FERTILIZERS[fertilizerId];
  return f?.growthSpeedMult ?? 1;
}

export function fertilizerHarvestExtra(fertilizerId: string | undefined): number {
  if (!fertilizerId) return 0;
  const f = FERTILIZERS[fertilizerId];
  return f?.harvestExtraCount ?? 0;
}
