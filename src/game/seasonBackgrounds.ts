import type { YearPhase } from "./types";

/** Page background tints for each growing phase (dark theme friendly). */
export const GROWING_SEASON_BG: Record<"spring" | "summer" | "fall", string> = {
  spring: "#132018",
  summer: "#121f28",
  fall: "#23180f",
};

export function backgroundForYearPhase(phase: YearPhase): string {
  if (phase === "winter") return "#0f1218";
  return GROWING_SEASON_BG[phase];
}
