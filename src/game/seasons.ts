/** Growing phases before the winter minigame; each has its own harvest quota. */
export type YearPhase = "spring" | "summer" | "fall" | "winter";

export const HARVEST_QUOTA_BY_PHASE: Record<"spring" | "summer" | "fall", number> = {
  spring: 20,
  summer: 25,
  fall: 10,
};

export function harvestQuotaForPhase(phase: YearPhase): number {
  if (phase === "winter") return 0;
  return HARVEST_QUOTA_BY_PHASE[phase];
}
