import { describe, it, expect } from 'vitest'
import { setName, damage, heal, setMaximumHealth, setTemporaryHealth, longRest, cast, regainSpellSlot, setSpellLevels, setTotalSpellSlots, adjustCurrency } from './actions'
import { Health } from './health'
import { SpellSlots } from './spellslots'
import { Currency } from './currency'
import type { State } from './state'

function makeState(): State {
  return {
    name: 'Aria',
    health: new Health(10, 20),
    spellSlots: new SpellSlots([{ total: 4, used: 1 }, { total: 3, used: 0 }]),
    currency: new Currency({ gp: 10 }),
  }
}

describe('setName', () => {
  it('updates name', () => {
    expect(setName(makeState(), 'Thorin').name).toBe('Thorin')
  })

  it('does not mutate original', () => {
    const s = makeState()
    setName(s, 'Thorin')
    expect(s.name).toBe('Aria')
  })
})

describe('damage', () => {
  it('decreases health', () => {
    expect(damage(makeState(), 3).health.current).toBe(7)
  })

  it('does not mutate original', () => {
    const s = makeState()
    damage(s, 3)
    expect(s.health.current).toBe(10)
  })
})

describe('heal', () => {
  it('increases health', () => {
    expect(heal(makeState(), 5).health.current).toBe(15)
  })

  it('does not mutate original', () => {
    const s = makeState()
    heal(s, 5)
    expect(s.health.current).toBe(10)
  })
})

describe('setMaximumHealth', () => {
  it('updates max health', () => {
    expect(setMaximumHealth(makeState(), 30).health.maximum).toBe(30)
  })
})

describe('setTemporaryHealth', () => {
  it('sets temporary health', () => {
    expect(setTemporaryHealth(makeState(), 5).health.temporary).toBe(5)
  })
})

describe('longRest', () => {
  it('restores health to maximum', () => {
    expect(longRest(makeState()).health.current).toBe(20)
  })

  it('restores all spell slots', () => {
    expect(longRest(makeState()).spellSlots.levels[0].used).toBe(0)
  })

  it('does not affect currency', () => {
    expect(longRest(makeState()).currency.gp).toBe(10)
  })
})

describe('cast', () => {
  it('uses a spell slot', () => {
    expect(cast(makeState(), 1).spellSlots.levels[0].used).toBe(2)
  })
})

describe('regainSpellSlot', () => {
  it('regains a spell slot', () => {
    expect(regainSpellSlot(makeState(), 1).spellSlots.levels[0].used).toBe(0)
  })
})

describe('setSpellLevels', () => {
  it('updates number of spell levels', () => {
    expect(setSpellLevels(makeState(), 3).spellSlots.levels).toHaveLength(3)
  })
})

describe('setTotalSpellSlots', () => {
  it('updates total for a level', () => {
    expect(setTotalSpellSlots(makeState(), 1, 6).spellSlots.levels[0].total).toBe(6)
  })
})

describe('adjustCurrency', () => {
  it('adjusts currency amount', () => {
    expect(adjustCurrency(makeState(), 'gp', 5).currency.gp).toBe(15)
  })
})
