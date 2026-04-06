import type { YearPhase } from "./seasons";

/** New games start with a small plot; the shop can expand up to `MAX_GRID_SIZE`. */
export const STARTING_GRID_SIZE = 1;
export const MAX_GRID_SIZE = 8;

export type { YearPhase };

export interface PlantedCell {
  seedId: string;
  /** Growth progress 0..1 */
  progress: number;
  mature: boolean;
  /** Fertilizer applied to this plant (cleared on harvest); one per crop */
  fertilizerId?: string;
}

export interface SeasonScore {
  totalEarnings: number;
  synergyEvents: number;
  cropsSold: number;
  /** Placement that changed growth meaningfully (tracked when multiplier != 1) */
  tilesWithSynergyGrowth: number;
  /** Total harvest taps completed this year (all growing phases) */
  harvestActionsCompleted: number;
  /** Total crop units added to bag from harvests (includes fertilizer extras) */
  cropUnitsHarvested: number;
  /** Winter survival outcome (year-end snapshot). */
  winterSurvived: boolean;
  winterHealthEnd: number;
  winterRationsEnd: number;
}

export interface GameState {
  grid: (PlantedCell | null)[][];
  money: number;
  /** Seeds available to plant this season */
  inventory: Record<string, number>;
  /** Fertilizer bags from the shop (applied to growing plants) */
  fertilizerInventory: Record<string, number>;
  paused: boolean;
  /** Crops picked but not cashed out yet */
  cropBag: Record<string, number>;
  synergyEvents: number;
  /** True when the year is over and the score screen should show */
  seasonEnded: boolean;
  /** Cumulative earnings from Sell actions this season */
  seasonEarnings: number;
  /** Total crops cashed out via Sell */
  totalCropsSold: number;
  /** Max concurrent tiles that had growth multiplier != 1 (for score interest) */
  peakSynergyTiles: number;
  /** Harvest actions left in the current growing phase; at 0 → next phase or winter */
  harvestsRemaining: number;
  /** Sum of crop units gained from harvests this year (1 + fertilizer extras per tap) */
  harvestCropUnitsTotal: number;
  /** Spring → summer → fall → winter */
  yearPhase: YearPhase;
  /** Counts every player harvest tap across spring, summer, and fall */
  yearHarvestActionsTotal: number;
  /** Which plant species can be planted / bought as seed packs (shop unlock or event). */
  unlockedSeeds: Record<string, boolean>;
  /** Preserved food for winter; 1 consumed each winter morning */
  rations: number;
  /** 0–100; starvation and events change this in winter */
  health: number;
  /** 1..WINTER_DAY_COUNT while in winter, else 0 */
  winterDay: number;
  winterEventId: string;
  winterMinigameComplete: boolean;
  winterFailed: boolean;
}
