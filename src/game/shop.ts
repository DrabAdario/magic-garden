import { MAX_GRID_SIZE } from "./types";

/** Coins to expand from `size` × `size` to `(size+1)` × `(size+1)`. */
export function expandGridCost(currentSize: number): number {
  if (currentSize >= MAX_GRID_SIZE) return Infinity;
  return 25 + (currentSize - 1) * 20;
}

export function canExpandGrid(currentSize: number): boolean {
  return currentSize < MAX_GRID_SIZE;
}
