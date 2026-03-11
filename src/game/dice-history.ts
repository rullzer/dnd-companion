import type { DiceResult } from './dice'

const MAX_HISTORY = 5

export function addToHistory(history: DiceResult[], result: DiceResult): DiceResult[] {
  return [result, ...history].slice(0, MAX_HISTORY)
}
