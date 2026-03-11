import { describe, it, expect } from 'vitest'
import { addToHistory } from './dice-history'
import type { DiceResult } from './dice'

const roll = (die: DiceResult['die'], total: number): DiceResult => ({ die, roll: total, modifier: 0, total })

describe('addToHistory', () => {
  it('adds a result to an empty history', () => {
    const history = addToHistory([], roll(20, 15))
    expect(history).toHaveLength(1)
    expect(history[0].total).toBe(15)
  })

  it('prepends the new result', () => {
    const existing = [roll(6, 3)]
    const history = addToHistory(existing, roll(20, 18))
    expect(history[0].die).toBe(20)
    expect(history[1].die).toBe(6)
  })

  it('caps history at 5', () => {
    const existing = [roll(4, 1), roll(6, 2), roll(8, 3), roll(10, 4), roll(12, 5)]
    const history = addToHistory(existing, roll(20, 6))
    expect(history).toHaveLength(5)
    expect(history[0].die).toBe(20)
    expect(history[4].die).toBe(10)
  })

  it('does not mutate the original history', () => {
    const existing = [roll(6, 3)]
    addToHistory(existing, roll(20, 18))
    expect(existing).toHaveLength(1)
  })
})
