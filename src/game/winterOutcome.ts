import type { WinterChoice } from "./winterEvents";
import { SEEDS } from "./seeds";

export type WinterOutcomeSnapshot = {
  /** The option the player picked */
  choiceLabel: string;
  /** Human-readable result lines */
  lines: string[];
};

/**
 * Builds feedback after a winter choice from deltas + unlock (BitLife-style recap).
 * `unlockedBefore` is the roster before this choice was applied.
 */
export function buildWinterOutcome(
  ch: WinterChoice,
  unlockedBefore: Record<string, boolean>,
): WinterOutcomeSnapshot {
  const lines: string[] = [];

  if (ch.healthDelta !== 0) {
    if (ch.healthDelta > 0) {
      lines.push(`You feel a little stronger — health up by ${ch.healthDelta}.`);
    } else {
      lines.push(`The strain costs you — health down by ${Math.abs(ch.healthDelta)}.`);
    }
  }

  if (ch.rationsDelta !== 0) {
    if (ch.rationsDelta > 0) {
      lines.push(`Your stores grow: +${ch.rationsDelta} ration(s).`);
    } else {
      lines.push(`Your stores shrink: ${ch.rationsDelta} ration(s).`);
    }
  }

  if (ch.moneyDelta !== 0) {
    if (ch.moneyDelta > 0) {
      lines.push(`Coin clinks into your jar: +${ch.moneyDelta}.`);
    } else {
      lines.push(`You pay out ${Math.abs(ch.moneyDelta)} coins.`);
    }
  }

  if (ch.unlockSeedId) {
    const def = SEEDS[ch.unlockSeedId];
    const name = def?.name ?? ch.unlockSeedId;
    if (unlockedBefore[ch.unlockSeedId]) {
      lines.push(`You already had ${name} in your book — no new species this time.`);
    } else {
      lines.push(`You tuck away a precious find: ${name} is unlocked for next spring.`);
    }
  }

  if (lines.length === 0) {
    lines.push("The moment passes. You carry on, much as before.");
  }

  return { choiceLabel: ch.label, lines };
}
