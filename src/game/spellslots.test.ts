import { describe, it, expect } from 'vitest'
import { SpellSlots } from './spellslots'

const makeSlots = (entries: Array<[total: number, used: number]>) =>
  new SpellSlots(entries.map(([total, used]) => ({ total, used })))

describe('SpellSlots constructor', () => {
  it('clamps used to [0, total]', () => {
    const slots = makeSlots([[4, 10]])
    expect(slots.levels[0].used).toBe(4)

    const slots2 = makeSlots([[4, -1]])
    expect(slots2.levels[0].used).toBe(0)
  })

  it('clamps total to >= 0', () => {
    const slots = makeSlots([[-2, 0]])
    expect(slots.levels[0].total).toBe(0)
  })

  it('truncates to max 9 levels', () => {
    const slots = new SpellSlots(
      Array.from({ length: 12 }, () => ({ total: 2, used: 0 }))
    )
    expect(slots.levels.length).toBe(9)
  })
})

describe('SpellSlots.cast', () => {
  it('increments used for the given level', () => {
    const slots = makeSlots([[3, 0]]).cast(1)
    expect(slots.levels[0].used).toBe(1)
  })

  it('clamps used at total (cannot over-cast)', () => {
    const slots = makeSlots([[2, 2]]).cast(1)
    expect(slots.levels[0].used).toBe(2)
  })

  it('ignores invalid levels', () => {
    const slots = makeSlots([[3, 0]])
    expect(slots.cast(0)).toBe(slots)
    expect(slots.cast(10)).toBe(slots)
  })

  it('ignores level that does not exist in levels array', () => {
    const slots = makeSlots([[3, 0]])
    const result = slots.cast(2) // only level 1 exists
    expect(result).toBe(slots)
  })
})

describe('SpellSlots.regain', () => {
  it('decrements used for the given level', () => {
    const slots = makeSlots([[3, 2]]).regain(1)
    expect(slots.levels[0].used).toBe(1)
  })

  it('clamps used at 0 (cannot regain below 0)', () => {
    const slots = makeSlots([[3, 0]]).regain(1)
    expect(slots.levels[0].used).toBe(0)
  })

  it('ignores invalid levels', () => {
    const slots = makeSlots([[3, 1]])
    expect(slots.regain(0)).toBe(slots)
    expect(slots.regain(10)).toBe(slots)
  })
})

describe('SpellSlots.restoreAll', () => {
  it('sets all used to 0', () => {
    const slots = makeSlots([[4, 3], [2, 2], [1, 1]]).restoreAll()
    for (const level of slots.levels) {
      expect(level.used).toBe(0)
    }
  })

  it('preserves totals', () => {
    const slots = makeSlots([[4, 3], [2, 2]]).restoreAll()
    expect(slots.levels[0].total).toBe(4)
    expect(slots.levels[1].total).toBe(2)
  })
})

describe('SpellSlots.setTotal', () => {
  it('updates total for a given level', () => {
    const slots = makeSlots([[4, 0]]).setTotal(1, 6)
    expect(slots.levels[0].total).toBe(6)
  })

  it('pads levels array if needed', () => {
    const slots = makeSlots([[4, 0]]).setTotal(3, 2)
    expect(slots.levels.length).toBe(3)
    expect(slots.levels[2].total).toBe(2)
  })

  it('ignores invalid levels', () => {
    const slots = makeSlots([[4, 0]])
    expect(slots.setTotal(0, 5)).toBe(slots)
    expect(slots.setTotal(10, 5)).toBe(slots)
  })
})

describe('SpellSlots.setLevels', () => {
  it('truncates levels to given count', () => {
    const slots = makeSlots([[4, 0], [2, 0], [1, 0]]).setLevels(2)
    expect(slots.levels.length).toBe(2)
  })

  it('pads levels with empty slots when count exceeds current length', () => {
    const slots = makeSlots([[4, 0]]).setLevels(3)
    expect(slots.levels.length).toBe(3)
    expect(slots.levels[1]).toEqual({ total: 0, used: 0 })
    expect(slots.levels[2]).toEqual({ total: 0, used: 0 })
  })
})
