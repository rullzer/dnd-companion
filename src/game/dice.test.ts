import { describe, it, expect, vi } from 'vitest'
import { rollDie, DICE } from './dice'

describe('rollDie', () => {
  it('returns the correct die', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = rollDie(6)
    expect(result.die).toBe(6)
    vi.restoreAllMocks()
  })

  it('roll is between 1 and die size (inclusive)', () => {
    for (const die of DICE) {
      for (let i = 0; i < 50; i++) {
        const { roll } = rollDie(die)
        expect(roll).toBeGreaterThanOrEqual(1)
        expect(roll).toBeLessThanOrEqual(die)
      }
    }
  })

  it('total equals roll', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = rollDie(20)
    expect(result.total).toBe(result.roll)
    vi.restoreAllMocks()
  })
})
