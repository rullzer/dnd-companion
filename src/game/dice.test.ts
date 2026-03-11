import { describe, it, expect, vi } from 'vitest'
import { rollDie, DICE } from './dice'

describe('rollDie', () => {
  it('returns the correct die and modifier', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = rollDie(6, 2)
    expect(result.die).toBe(6)
    expect(result.modifier).toBe(2)
    vi.restoreAllMocks()
  })

  it('roll is between 1 and die size (inclusive)', () => {
    for (const die of DICE) {
      for (let i = 0; i < 50; i++) {
        const { roll } = rollDie(die, 0)
        expect(roll).toBeGreaterThanOrEqual(1)
        expect(roll).toBeLessThanOrEqual(die)
      }
    }
  })

  it('total equals roll + modifier', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = rollDie(20, 5)
    expect(result.total).toBe(result.roll + result.modifier)
    vi.restoreAllMocks()
  })

  it('total is correct with negative modifier', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0) // roll = 1
    const result = rollDie(8, -2)
    expect(result.roll).toBe(1)
    expect(result.total).toBe(-1)
    vi.restoreAllMocks()
  })
})
