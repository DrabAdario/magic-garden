export type WinterChoice = {
  label: string;
  healthDelta: number;
  rationsDelta: number;
  moneyDelta: number;
};

export type WinterEventDef = {
  id: string;
  text: string;
  choices: [WinterChoice, WinterChoice];
};

/** Random narrative beats — BitLife / Oregon Trail style. */
export const WINTER_EVENTS: WinterEventDef[] = [
  {
    id: "thief",
    text: "A hooded figure slips past your frost-covered window. Your pantry sack looks lighter than you remember.",
    choices: [
      { label: "Chase them into the snow (−stamina)", healthDelta: -12, rationsDelta: 0, moneyDelta: 0 },
      { label: "Bar the door and count losses", healthDelta: -5, rationsDelta: -2, moneyDelta: 0 },
    ],
  },
  {
    id: "beggar",
    text: "Someone knocks—thin voice, empty hands. “Just one night by the hearth.”",
    choices: [
      { label: "Offer soup and a corner", healthDelta: 4, rationsDelta: -1, moneyDelta: 0 },
      { label: "Turn them away", healthDelta: -6, rationsDelta: 0, moneyDelta: 0 },
    ],
  },
  {
    id: "aurora",
    text: "The sky ripples green and violet. For a moment the cold feels almost kind.",
    choices: [
      { label: "Stand outside and breathe", healthDelta: 10, rationsDelta: 0, moneyDelta: 0 },
      { label: "Stay in and rest", healthDelta: 5, rationsDelta: 0, moneyDelta: 0 },
    ],
  },
  {
    id: "frozen_pipe",
    text: "The water line groans. A pipe has burst behind the wall—ice everywhere.",
    choices: [
      { label: "Spend coin on repairs", healthDelta: -4, rationsDelta: 0, moneyDelta: -15 },
      { label: "Patch it yourself", healthDelta: -14, rationsDelta: 0, moneyDelta: 0 },
    ],
  },
  {
    id: "wolf",
    text: "Yellow eyes at the tree line. Something howls—close, then farther, then close again.",
    choices: [
      { label: "Light a torch and shout", healthDelta: -8, rationsDelta: 0, moneyDelta: 0 },
      { label: "Stay silent and still", healthDelta: -3, rationsDelta: 0, moneyDelta: 0 },
    ],
  },
  {
    id: "traveler",
    text: "A merchant’s sleigh tips in the drift. They offer a trinket for help digging them out.",
    choices: [
      { label: "Help for free", healthDelta: -6, rationsDelta: 0, moneyDelta: 12 },
      { label: "Refuse—you’re low on strength", healthDelta: 0, rationsDelta: 0, moneyDelta: 0 },
    ],
  },
  {
    id: "fever",
    text: "Your head pounds. The room swims. Winter has found a way inside your bones.",
    choices: [
      { label: "Burn extra fuel and herbs", healthDelta: 14, rationsDelta: -1, moneyDelta: -8 },
      { label: "Sleep it off", healthDelta: -10, rationsDelta: 0, moneyDelta: 0 },
    ],
  },
  {
    id: "cache",
    text: "Behind a loose board you find last autumn’s forgotten jar—still sealed.",
    choices: [
      { label: "Eat it now", healthDelta: 6, rationsDelta: 2, moneyDelta: 0 },
      { label: "Save for later", healthDelta: 2, rationsDelta: 3, moneyDelta: 0 },
    ],
  },
  {
    id: "blizzard",
    text: "Wind slams the shutters. You can’t see the barn—only white noise and cold.",
    choices: [
      { label: "Hunker down with blankets", healthDelta: -5, rationsDelta: -1, moneyDelta: 0 },
      { label: "Risk a quick wood run", healthDelta: -15, rationsDelta: 0, moneyDelta: 0 },
    ],
  },
  {
    id: "child",
    text: "A child from the next hollow appears, cheeks red, holding a carved wooden horse—to trade for food.",
    choices: [
      { label: "Trade one ration", healthDelta: 6, rationsDelta: -1, moneyDelta: 0 },
      { label: "Send them home empty", healthDelta: -8, rationsDelta: 0, moneyDelta: 0 },
    ],
  },
];

const byId = Object.fromEntries(WINTER_EVENTS.map((e) => [e.id, e])) as Record<string, WinterEventDef>;

export function getWinterEvent(id: string): WinterEventDef | undefined {
  return byId[id];
}

export function pickRandomWinterEventId(excludeId?: string): string {
  const pool = excludeId
    ? WINTER_EVENTS.filter((e) => e.id !== excludeId)
    : WINTER_EVENTS;
  const i = Math.floor(Math.random() * pool.length);
  return pool[i]!.id;
}
