export const DICE = [4, 6, 8, 10, 12, 20, 100] as const;

export type Die = typeof DICE[number];

export type DiceResult = {
  die: Die;
  roll: number;
  total: number;
};

export function rollDie(die: Die): DiceResult {
  const roll = Math.floor(Math.random() * die) + 1;
  return { die, roll, total: roll };
}
