import { HARVEST_QUOTA_BY_PHASE } from "./seasons";
import {
  STARTING_GRID_SIZE,
  type GameState,
  type PlantedCell,
  type SeasonScore,
} from "./types";
import { fertilizerGrowthMult, fertilizerHarvestExtra, FERTILIZERS } from "./fertilizers";
import { canExpandGrid, expandGridCost } from "./shop";
import {
  createInitialUnlockedSeeds,
  getSeed,
  growthMultiplierAt,
  pickRandomStarterSeedId,
  SEEDS,
} from "./seeds";
import {
  buyRations,
  convertCropBagToRations,
  enterWinterPhase,
  resolveWinterChoice,
} from "./winterSimulation";

/** Spring, summer, or fall — active garden. Winter is the minigame interlude. */
export function isGrowingSeason(state: GameState): boolean {
  return (
    !state.seasonEnded &&
    (state.yearPhase === "spring" || state.yearPhase === "summer" || state.yearPhase === "fall")
  );
}

export function emptyGrid(size: number): (PlantedCell | null)[][] {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null),
  );
}

export { pickRandomStarterSeedId };

function normalizeStarterSeedId(starterSeedId: string): string {
  const u = createInitialUnlockedSeeds();
  if (u[starterSeedId]) return starterSeedId;
  return "carrot";
}

export function createInitialState(starterSeedId: string = pickRandomStarterSeedId()): GameState {
  const sid = normalizeStarterSeedId(starterSeedId);
  return {
    grid: emptyGrid(STARTING_GRID_SIZE),
    money: 0,
    inventory: { [sid]: 1 },
    fertilizerInventory: {},
    paused: false,
    cropBag: {},
    synergyEvents: 0,
    seasonEnded: false,
    seasonEarnings: 0,
    totalCropsSold: 0,
    peakSynergyTiles: 0,
    harvestsRemaining: HARVEST_QUOTA_BY_PHASE.spring,
    harvestCropUnitsTotal: 0,
    yearPhase: "spring",
    yearHarvestActionsTotal: 0,
    unlockedSeeds: createInitialUnlockedSeeds(),
    rations: 0,
    health: 100,
    winterDay: 0,
    winterEventId: "",
    winterMinigameComplete: false,
    winterFailed: false,
  };
}

export function gridSize(grid: (PlantedCell | null)[][]): number {
  return grid.length;
}

export function countSynergyTiles(grid: (PlantedCell | null)[][]): number {
  let n = 0;
  const h = grid.length;
  for (let r = 0; r < h; r++) {
    const w = grid[r].length;
    for (let c = 0; c < w; c++) {
      const cell = grid[r][c];
      if (!cell || cell.mature) continue;
      const m = growthMultiplierAt(grid, r, c);
      if (Math.abs(m - 1) > 0.001) n++;
    }
  }
  return n;
}

function canPlace(state: GameState, seedId: string): boolean {
  return (state.inventory[seedId] ?? 0) > 0;
}

export function placeSeed(
  state: GameState,
  row: number,
  col: number,
  seedId: string,
): GameState {
  if (!isGrowingSeason(state)) return state;
  const h = state.grid.length;
  const w = state.grid[0]?.length ?? 0;
  if (row < 0 || row >= h || col < 0 || col >= w) return state;
  if (!SEEDS[seedId]) return state;
  if (!state.unlockedSeeds[seedId]) return state;
  if (!canPlace(state, seedId)) return state;
  if (state.grid[row][col]) return state;

  const next: GameState = {
    ...state,
    grid: state.grid.map((rowArr) => rowArr.slice()),
    inventory: { ...state.inventory },
  };
  next.inventory[seedId] = (next.inventory[seedId] ?? 0) - 1;
  next.grid[row][col] = {
    seedId,
    progress: 0,
    mature: false,
    fertilizerId: undefined,
  };
  return next;
}

/**
 * Core harvest: move crop to bag. `countQuota` false for end-of-season auto-pick (does not spend quota).
 */
function harvestCellImpl(
  state: GameState,
  row: number,
  col: number,
  countQuota: boolean,
): GameState {
  if (state.seasonEnded || (countQuota && !isGrowingSeason(state))) return state;
  const cell = state.grid[row]?.[col];
  if (!cell || !cell.mature) return state;

  const next: GameState = {
    ...state,
    grid: state.grid.map((r) => r.slice()),
    cropBag: { ...state.cropBag },
  };
  const id = cell.seedId;
  const extra = fertilizerHarvestExtra(cell.fertilizerId);
  const units = 1 + extra;
  next.cropBag[id] = (next.cropBag[id] ?? 0) + units;
  next.grid[row][col] = null;
  if (countQuota) {
    next.harvestsRemaining = Math.max(0, state.harvestsRemaining - 1);
    next.harvestCropUnitsTotal = state.harvestCropUnitsTotal + units;
    next.yearHarvestActionsTotal = state.yearHarvestActionsTotal + 1;
  }
  return next;
}

/** Player harvest: spends one quota tick; at 0 → next growing phase or winter. */
export function harvestCell(state: GameState, row: number, col: number): GameState {
  if (!isGrowingSeason(state)) return state;
  if (state.harvestsRemaining <= 0) return state;
  const next = harvestCellImpl(state, row, col, true);
  if (next === state) return state;
  if (next.harvestsRemaining === 0) {
    return transitionGrowingPhase(next);
  }
  return next;
}

export function sellAllCrops(state: GameState): GameState {
  if (state.seasonEnded) return state;
  let gain = 0;
  let sold = 0;
  const cropBag = { ...state.cropBag };
  for (const [seedId, count] of Object.entries(cropBag)) {
    if (count <= 0) continue;
    const def = getSeed(seedId);
    gain += count * def.sellPrice;
    sold += count;
    cropBag[seedId] = 0;
  }
  return {
    ...state,
    cropBag,
    money: state.money + gain,
    seasonEarnings: state.seasonEarnings + gain,
    totalCropsSold: state.totalCropsSold + sold,
  };
}

/** Move every mature crop into the bag (used before final sell). */
export function harvestAllMature(state: GameState): GameState {
  if (state.seasonEnded) return state;
  let s = state;
  const h = s.grid.length;
  const w = s.grid[0]?.length ?? 0;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (s.grid[r][c]?.mature) {
        s = harvestCellImpl(s, r, c, false);
      }
    }
  }
  return s;
}

/**
 * Pick any remaining mature crops, sell the bag, then move to the next growing phase or winter.
 */
export function transitionGrowingPhase(state: GameState): GameState {
  let s = harvestAllMature(state);
  s = sellAllCrops(s);
  if (s.yearPhase === "spring") {
    return {
      ...s,
      yearPhase: "summer",
      harvestsRemaining: HARVEST_QUOTA_BY_PHASE.summer,
      paused: false,
    };
  }
  if (s.yearPhase === "summer") {
    return {
      ...s,
      yearPhase: "fall",
      harvestsRemaining: HARVEST_QUOTA_BY_PHASE.fall,
      paused: false,
    };
  }
  if (s.yearPhase === "fall") {
    return enterWinterPhase(s);
  }
  return s;
}

/** End the current growing phase early (spring / summer / fall) and advance. */
export function advanceSeasonEarly(state: GameState): GameState {
  if (state.seasonEnded || !isGrowingSeason(state)) return state;
  return transitionGrowingPhase(state);
}

/** Call after winter when the player is ready for year-end stats. */
export function finalizeYearToScoreScreen(state: GameState): GameState {
  if (state.yearPhase !== "winter") return state;
  if (!state.winterMinigameComplete && !state.winterFailed) return state;
  return { ...state, seasonEnded: true, paused: true };
}

const ORTHO: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function cloneGrid(grid: (PlantedCell | null)[][]): (PlantedCell | null)[][] {
  return grid.map((row) => row.slice());
}

function expandGridSquare(grid: (PlantedCell | null)[][]): (PlantedCell | null)[][] {
  const n = grid.length;
  const next = grid.map((row) => [...row, null as PlantedCell | null]);
  next.push(Array.from({ length: n + 1 }, () => null));
  return next;
}

/** Add one row and one column; pay `expandGridCost(currentSize)`. */
export function buyExpandGrid(state: GameState): GameState {
  if (state.seasonEnded || !isGrowingSeason(state)) return state;
  const n = state.grid.length;
  if (!canExpandGrid(n)) return state;
  const cost = expandGridCost(n);
  if (state.money < cost) return state;
  return {
    ...state,
    money: state.money - cost,
    grid: expandGridSquare(state.grid),
  };
}

export function buySeedPack(state: GameState, seedId: string, qty: number): GameState {
  if (state.seasonEnded || !isGrowingSeason(state) || qty <= 0) return state;
  const def = SEEDS[seedId];
  if (!def) return state;
  if (!state.unlockedSeeds[seedId]) return state;
  const cost = def.shopPrice * qty;
  if (state.money < cost) return state;
  const next: GameState = {
    ...state,
    money: state.money - cost,
    inventory: { ...state.inventory },
  };
  next.inventory[seedId] = (next.inventory[seedId] ?? 0) + qty;
  return next;
}

/** One-time purchase to add a locked species to your roster (then buy seed packs as usual). */
export function unlockSeedFromShop(state: GameState, seedId: string): GameState {
  if (state.seasonEnded || !isGrowingSeason(state)) return state;
  const def = SEEDS[seedId];
  if (!def?.unlockShopPrice) return state;
  if (state.unlockedSeeds[seedId]) return state;
  if (state.money < def.unlockShopPrice) return state;
  return {
    ...state,
    money: state.money - def.unlockShopPrice,
    unlockedSeeds: { ...state.unlockedSeeds, [seedId]: true },
  };
}

export function buyFertilizer(state: GameState, fertilizerId: string, qty: number): GameState {
  if (state.seasonEnded || !isGrowingSeason(state) || qty <= 0) return state;
  const def = FERTILIZERS[fertilizerId];
  if (!def) return state;
  const cost = def.shopPrice * qty;
  if (state.money < cost) return state;
  const next: GameState = {
    ...state,
    money: state.money - cost,
    fertilizerInventory: { ...state.fertilizerInventory },
  };
  next.fertilizerInventory[fertilizerId] = (next.fertilizerInventory[fertilizerId] ?? 0) + qty;
  return next;
}

/** Apply a fertilizer bag to an immature plant. One fertilizer per crop; cannot stack. */
export function applyFertilizer(
  state: GameState,
  row: number,
  col: number,
  fertilizerId: string,
): GameState {
  if (state.seasonEnded || !isGrowingSeason(state)) return state;
  if (!FERTILIZERS[fertilizerId]) return state;
  if ((state.fertilizerInventory[fertilizerId] ?? 0) <= 0) return state;
  const h = state.grid.length;
  const w = state.grid[0]?.length ?? 0;
  if (row < 0 || row >= h || col < 0 || col >= w) return state;
  const cell = state.grid[row][col];
  if (!cell || cell.mature || cell.fertilizerId) return state;

  const next: GameState = {
    ...state,
    grid: state.grid.map((r) => r.slice()),
    fertilizerInventory: { ...state.fertilizerInventory },
  };
  next.fertilizerInventory[fertilizerId] = (next.fertilizerInventory[fertilizerId] ?? 0) - 1;
  if (next.fertilizerInventory[fertilizerId] === 0) {
    delete next.fertilizerInventory[fertilizerId];
  }
  next.grid[row][col] = { ...cell, fertilizerId };
  return next;
}

/**
 * When a tile becomes mature, orthogonal beans get a one-time progress boost.
 * New maturities from chains are processed in the same wave (queue).
 */
function applyMatureChains(
  grid: (PlantedCell | null)[][],
  synergyEvents: number,
  startQueue: [number, number][],
): { grid: (PlantedCell | null)[][]; synergyEvents: number } {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  let g = cloneGrid(grid);
  let events = synergyEvents;
  const queue = [...startQueue];
  let safety = 0;

  while (queue.length > 0 && safety++ < 256) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of ORTHO) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= h || nc < 0 || nc >= w) continue;
      const neighbor = g[nr][nc];
      if (!neighbor || neighbor.mature) continue;
      const bonus = SEEDS[neighbor.seedId].chainMatureProgress;
      if (bonus === undefined) continue;

      const progress = neighbor.progress + bonus;
      events += 1;
      if (progress >= 1) {
        g[nr][nc] = { ...neighbor, progress: 1, mature: true };
        queue.push([nr, nc]);
      } else {
        g[nr][nc] = { ...neighbor, progress };
      }
    }
  }

  return { grid: g, synergyEvents: events };
}

export function tick(state: GameState, deltaMs: number): GameState {
  if (state.paused || state.seasonEnded || !isGrowingSeason(state) || deltaMs <= 0) return state;

  let grid = cloneGrid(state.grid);
  let synergyEvents = state.synergyEvents;
  const h = grid.length;
  const w = grid[0]?.length ?? 0;

  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const cell = grid[r][c];
      if (!cell || cell.mature) continue;
      const def = getSeed(cell.seedId);
      const mult = growthMultiplierAt(grid, r, c);
      const fertMult = fertilizerGrowthMult(cell.fertilizerId);
      const delta = (deltaMs / def.growDurationMs) * mult * fertMult;
      grid[r][c] = { ...cell, progress: cell.progress + delta };
    }
  }

  const newMatures: [number, number][] = [];
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const cell = grid[r][c];
      if (!cell || cell.mature) continue;
      if (cell.progress >= 1) {
        grid[r][c] = { ...cell, mature: true, progress: 1 };
        newMatures.push([r, c]);
      }
    }
  }

  const chained = applyMatureChains(grid, synergyEvents, newMatures);
  grid = chained.grid;
  synergyEvents = chained.synergyEvents;

  const peak = Math.max(state.peakSynergyTiles, countSynergyTiles(grid));

  return {
    ...state,
    grid,
    synergyEvents,
    peakSynergyTiles: peak,
  };
}

export function computeSeasonScore(state: GameState): SeasonScore {
  return {
    totalEarnings: state.seasonEarnings,
    synergyEvents: state.synergyEvents,
    cropsSold: state.totalCropsSold,
    tilesWithSynergyGrowth: state.peakSynergyTiles,
    harvestActionsCompleted: state.yearHarvestActionsTotal,
    cropUnitsHarvested: state.harvestCropUnitsTotal,
    winterSurvived: !state.winterFailed,
    winterHealthEnd: state.health,
    winterRationsEnd: state.rations,
  };
}

export { buyRations, convertCropBagToRations, enterWinterPhase, resolveWinterChoice };
export { RATION_SHOP_PRICE } from "./winterConstants";
