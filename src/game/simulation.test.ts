import { describe, expect, it } from "vitest";
import { HARVEST_QUOTA_BY_PHASE } from "./seasons";
import { FERTILIZERS } from "./fertilizers";
import {
  advanceSeasonEarly,
  applyFertilizer,
  buyExpandGrid,
  buyFertilizer,
  buyRations,
  buySeedPack,
  convertCropBagToRations,
  createInitialState,
  emptyGrid,
  enterWinterPhase,
  harvestCell,
  placeSeed,
  resolveWinterChoice,
  sellAllCrops,
  tick,
  unlockSeedFromShop,
} from "./simulation";
import { growthMultiplierAt } from "./seeds";

describe("growthMultiplierAt", () => {
  it("is 1 for isolated carrot", () => {
    const grid = emptyGrid(5);
    grid[2][2] = { seedId: "carrot", progress: 0, mature: false };
    expect(growthMultiplierAt(grid, 2, 2)).toBe(1);
  });

  it("increases with ortho tomato neighbor", () => {
    const grid = emptyGrid(5);
    grid[2][2] = { seedId: "carrot", progress: 0, mature: false };
    grid[2][3] = { seedId: "tomato", progress: 0, mature: false };
    const m = growthMultiplierAt(grid, 2, 2);
    expect(m).toBeGreaterThan(1);
  });

  it("applies pumpkin slow to ortho neighbors", () => {
    const grid = emptyGrid(5);
    grid[2][2] = { seedId: "carrot", progress: 0, mature: false };
    grid[3][2] = { seedId: "pumpkin", progress: 0, mature: false };
    const m = growthMultiplierAt(grid, 2, 2);
    expect(m).toBeLessThan(1);
  });
});

describe("tick", () => {
  it("does not advance when paused", () => {
    let s = createInitialState("carrot");
    s = placeSeed(s, 0, 0, "carrot");
    s = { ...s, paused: true };
    const next = tick(s, 10_000);
    expect(next.grid[0][0]?.progress).toBe(0);
  });

  it("matures carrot after enough time", () => {
    let s = createInitialState("carrot");
    s = placeSeed(s, 0, 0, "carrot");
    s = tick(s, 20_000);
    expect(s.grid[0][0]?.mature).toBe(true);
  });
});

describe("harvest and sell", () => {
  it("moves mature crop to bag and sell adds money", () => {
    let s = createInitialState("carrot");
    expect(s.harvestsRemaining).toBe(HARVEST_QUOTA_BY_PHASE.spring);
    expect(s.yearPhase).toBe("spring");
    s = placeSeed(s, 0, 0, "carrot");
    s = tick(s, 20_000);
    expect(s.grid[0][0]?.mature).toBe(true);
    s = harvestCell(s, 0, 0);
    expect(s.harvestsRemaining).toBe(HARVEST_QUOTA_BY_PHASE.spring - 1);
    expect(s.yearHarvestActionsTotal).toBe(1);
    expect(s.harvestCropUnitsTotal).toBe(1);
    expect(s.cropBag.carrot).toBe(1);
    expect(s.grid[0][0]).toBeNull();
    s = sellAllCrops(s);
    expect(s.money).toBe(8);
    expect(s.seasonEarnings).toBe(8);
    expect(s.totalCropsSold).toBe(1);
  });
});

describe("advanceSeasonEarly", () => {
  it("sells bag and moves spring to summer", () => {
    let s = createInitialState("carrot");
    s = placeSeed(s, 0, 0, "carrot");
    s = tick(s, 20_000);
    s = harvestCell(s, 0, 0);
    expect(s.cropBag.carrot).toBe(1);
    s = advanceSeasonEarly(s);
    expect(s.yearPhase).toBe("summer");
    expect(s.harvestsRemaining).toBe(HARVEST_QUOTA_BY_PHASE.summer);
    expect(s.money).toBe(8);
    expect(s.cropBag.carrot).toBe(0);
  });
});

describe("harvest quota", () => {
  it("enters winter when fall quota is exhausted", () => {
    let s = createInitialState("carrot");
    s = { ...s, yearPhase: "fall", harvestsRemaining: 1 };
    s = placeSeed(s, 0, 0, "carrot");
    s = tick(s, 20_000);
    s = harvestCell(s, 0, 0);
    expect(s.yearPhase).toBe("winter");
    expect(s.paused).toBe(true);
    expect(s.harvestsRemaining).toBe(0);
    expect(s.winterDay).toBe(1);
    expect(s.health).toBeGreaterThan(0);
    expect(s.winterEventId).not.toBe("");
    expect(s.winterMinigameComplete).toBe(false);
  });
});

describe("rations and winter", () => {
  it("buyRations adds rations during spring", () => {
    let s = createInitialState("carrot");
    s = { ...s, money: 100 };
    s = buyRations(s, 3);
    expect(s.rations).toBe(3);
    expect(s.money).toBe(100 - 30);
  });

  it("convertCropBagToRations moves bag units to rations", () => {
    let s = createInitialState("carrot");
    s = { ...s, cropBag: { carrot: 2 } };
    s = convertCropBagToRations(s);
    expect(s.rations).toBe(2);
    expect(s.cropBag.carrot ?? 0).toBe(0);
  });

  it("completes winter after 10 event choices with enough rations", () => {
    let s = createInitialState("carrot");
    s = { ...s, yearPhase: "fall", harvestsRemaining: 0, rations: 20 };
    s = enterWinterPhase(s);
    expect(s.winterDay).toBe(1);
    let guard = 0;
    while (!s.winterMinigameComplete && !s.winterFailed && guard++ < 30) {
      s = resolveWinterChoice(s, 0);
    }
    expect(s.winterMinigameComplete).toBe(true);
    expect(s.winterFailed).toBe(false);
  });
});

describe("grid bounds", () => {
  it("rejects bad placement", () => {
    const s = createInitialState("carrot");
    const n = s.grid.length;
    const bad = placeSeed(s, n, 0, "carrot");
    expect(bad).toBe(s);
    const bad2 = placeSeed(s, -1, 0, "carrot");
    expect(bad2).toBe(s);
  });
});

describe("shop expand", () => {
  it("grows the grid when player can pay", () => {
    let s = createInitialState("carrot");
    s = { ...s, money: 100 };
    s = buyExpandGrid(s);
    expect(s.grid.length).toBe(2);
    expect(s.grid[0]?.length).toBe(2);
    expect(s.money).toBe(75);
  });

  it("does nothing if too poor", () => {
    const s = createInitialState("carrot");
    const next = buyExpandGrid(s);
    expect(next).toBe(s);
  });
});

describe("fertilizers", () => {
  it("buyFertilizer deducts coins and adds bags", () => {
    let s = createInitialState("carrot");
    s = { ...s, money: 100 };
    s = buyFertilizer(s, "sprout_rush", 1);
    expect(s.fertilizerInventory.sprout_rush).toBe(1);
    expect(s.money).toBe(100 - FERTILIZERS.sprout_rush.shopPrice);
  });

  it("applyFertilizer attaches to immature plant and consumes a bag", () => {
    let s = createInitialState("carrot");
    s = placeSeed(s, 0, 0, "carrot");
    s = { ...s, fertilizerInventory: { sprout_rush: 1 } };
    s = applyFertilizer(s, 0, 0, "sprout_rush");
    expect(s.grid[0][0]?.fertilizerId).toBe("sprout_rush");
    expect(s.fertilizerInventory.sprout_rush).toBeUndefined();
  });

  it("sprout rush increases growth rate", () => {
    let base = createInitialState("carrot");
    base = placeSeed(base, 0, 0, "carrot");
    let fast = createInitialState("carrot");
    fast = placeSeed(fast, 0, 0, "carrot");
    fast = { ...fast, fertilizerInventory: { sprout_rush: 1 } };
    fast = applyFertilizer(fast, 0, 0, "sprout_rush");
    base = tick(base, 400);
    fast = tick(fast, 400);
    expect(fast.grid[0][0]!.progress).toBeGreaterThan(base.grid[0][0]!.progress);
  });

  it("bounty blend adds extra crop on harvest", () => {
    let s = createInitialState("carrot");
    s = placeSeed(s, 0, 0, "carrot");
    s = { ...s, fertilizerInventory: { bounty_blend: 1 } };
    s = applyFertilizer(s, 0, 0, "bounty_blend");
    s = tick(s, 20_000);
    s = harvestCell(s, 0, 0);
    expect(s.cropBag.carrot).toBe(2);
  });
});

describe("seed unlocks", () => {
  it("unlockSeedFromShop allows buying seed packs", () => {
    let s = createInitialState("carrot");
    s = { ...s, money: 200 };
    s = unlockSeedFromShop(s, "bean");
    expect(s.unlockedSeeds.bean).toBe(true);
    expect(s.money).toBe(200 - 85);
    s = buySeedPack(s, "bean", 1);
    expect(s.inventory.bean).toBe(1);
  });

  it("blocks placeSeed until species is unlocked", () => {
    let s = createInitialState("carrot");
    s = { ...s, inventory: { carrot: 0, bean: 1 } };
    const blocked = placeSeed(s, 0, 0, "bean");
    expect(blocked).toBe(s);
  });
});

describe("bean chain", () => {
  it("gives bean a progress boost when ortho neighbor matures", () => {
    let s = createInitialState("carrot");
    s = {
      ...s,
      grid: emptyGrid(4),
      unlockedSeeds: { ...s.unlockedSeeds, bean: true },
      inventory: { ...s.inventory, carrot: 1, bean: 1 },
    };
    s = placeSeed(s, 0, 0, "carrot");
    s = placeSeed(s, 0, 1, "bean");
    const beanBefore = s.grid[0][1]!;
    expect(beanBefore.progress).toBe(0);
    // Carrot finishes in ~1000ms; bean needs longer. A huge tick matures both in one frame and skips the chain.
    s = tick(s, 1100);
    expect(s.grid[0][0]?.mature).toBe(true);
    const beanAfter = s.grid[0][1]!;
    expect(beanAfter.progress).toBeGreaterThan(0.15);
    expect(s.synergyEvents).toBeGreaterThanOrEqual(1);
  });
});
