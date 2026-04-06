import type { GameState } from "./types";
import {
  HEALTH_MAX,
  RATION_SHOP_PRICE,
  STARVATION_DAMAGE,
  WINTER_DAY_COUNT,
} from "./winterConstants";
import { getWinterEvent, pickRandomWinterEventId } from "./winterEvents";

function clampHealth(n: number): number {
  return Math.max(0, Math.min(HEALTH_MAX, n));
}

/** Start-of-day: eat one ration or take starvation damage. */
export function applyWinterMorning(state: GameState): GameState {
  if (state.rations >= 1) {
    return { ...state, rations: state.rations - 1 };
  }
  return { ...state, health: Math.max(0, state.health - STARVATION_DAMAGE) };
}

/** Called when entering winter after fall (after transition sells/harvests). */
export function enterWinterPhase(state: GameState): GameState {
  let s: GameState = {
    ...state,
    yearPhase: "winter",
    harvestsRemaining: 0,
    paused: true,
    winterDay: 1,
    health: HEALTH_MAX,
    winterMinigameComplete: false,
    winterFailed: false,
    winterEventId: "",
  };
  s = applyWinterMorning(s);
  if (s.health <= 0) {
    return { ...s, winterFailed: true };
  }
  return { ...s, winterEventId: pickRandomWinterEventId() };
}

function applyChoice(state: GameState, choiceIndex: number): GameState {
  const ev = getWinterEvent(state.winterEventId);
  if (!ev) return state;
  const ch = ev.choices[choiceIndex];
  if (!ch) return state;
  return {
    ...state,
    health: clampHealth(state.health + ch.healthDelta),
    rations: Math.max(0, state.rations + ch.rationsDelta),
    money: Math.max(0, state.money + ch.moneyDelta),
  };
}

/**
 * Apply the chosen option. If this was the last winter day, marks minigame complete.
 * Otherwise advances the day, runs morning ration, and rolls the next event.
 */
export function resolveWinterChoice(state: GameState, choiceIndex: 0 | 1): GameState {
  if (state.yearPhase !== "winter" || state.winterFailed || state.winterMinigameComplete) {
    return state;
  }
  let s = applyChoice(state, choiceIndex);
  if (s.health <= 0) {
    return { ...s, winterFailed: true };
  }

  if (s.winterDay >= WINTER_DAY_COUNT) {
    return { ...s, winterMinigameComplete: true };
  }

  s = { ...s, winterDay: s.winterDay + 1 };
  s = applyWinterMorning(s);
  if (s.health <= 0) {
    return { ...s, winterFailed: true };
  }
  return { ...s, winterEventId: pickRandomWinterEventId(state.winterEventId) };
}

/** 1 crop unit from the bag → 1 ration (whole bag at once). Growing seasons only. */
export function convertCropBagToRations(state: GameState): GameState {
  if (state.seasonEnded || !isGrowingSeasonState(state)) return state;
  let total = 0;
  const cropBag = { ...state.cropBag };
  for (const k of Object.keys(cropBag)) {
    total += cropBag[k] ?? 0;
    cropBag[k] = 0;
  }
  if (total <= 0) return state;
  return {
    ...state,
    cropBag,
    rations: state.rations + total,
  };
}

function isGrowingSeasonState(state: GameState): boolean {
  return (
    !state.seasonEnded &&
    (state.yearPhase === "spring" || state.yearPhase === "summer" || state.yearPhase === "fall")
  );
}

/** Buy rations during spring / summer / fall only. */
export function buyRations(state: GameState, qty: number): GameState {
  if (state.seasonEnded || qty <= 0 || !isGrowingSeasonState(state)) return state;
  const cost = RATION_SHOP_PRICE * qty;
  if (state.money < cost) return state;
  return {
    ...state,
    money: state.money - cost,
    rations: state.rations + qty,
  };
}
