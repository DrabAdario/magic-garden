/** New games start with a small plot; the shop can expand up to `MAX_GRID_SIZE`. */
export const STARTING_GRID_SIZE = 4;
export const MAX_GRID_SIZE = 8;

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
  seasonEnded: boolean;
  /** Cumulative earnings from Sell actions this season */
  seasonEarnings: number;
  /** Total crops cashed out via Sell */
  totalCropsSold: number;
  /** Max concurrent tiles that had growth multiplier != 1 (for score interest) */
  peakSynergyTiles: number;
}
