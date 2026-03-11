import { describe, it, expect } from 'vitest'
import { Game } from './game'
import { Health } from './game/health'
import { SpellSlots } from './game/spellslots'
import { Currency } from './game/currency'

function makeGame() {
  return new Game({
    name: 'Aria',
    health: new Health(10, 20),
    spellSlots: new SpellSlots([{ total: 4, used: 1 }, { total: 3, used: 0 }]),
    currency: new Currency({ gp: 10 }),
  })
}

describe('Game.setName', () => {
  it('updates name', () => {
    const game = makeGame()
    game.setName('Thorin')
    expect(game.state.name).toBe('Thorin')
  })
})

describe('Game.damage', () => {
  it('decreases health', () => {
    const game = makeGame()
    game.damage(3)
    expect(game.state.health.current).toBe(7)
  })
})

describe('Game.heal', () => {
  it('increases health', () => {
    const game = makeGame()
    game.heal(5)
    expect(game.state.health.current).toBe(15)
  })
})

describe('Game.setMaximumHealth', () => {
  it('updates max health', () => {
    const game = makeGame()
    game.setMaximumHealth(30)
    expect(game.state.health.maximum).toBe(30)
  })
})

describe('Game.setTemporaryHealth', () => {
  it('sets temporary health', () => {
    const game = makeGame()
    game.setTemporaryHealth(5)
    expect(game.state.health.temporary).toBe(5)
  })
})

describe('Game.longRest', () => {
  it('restores health to maximum', () => {
    const game = makeGame()
    game.longRest()
    expect(game.state.health.current).toBe(20)
  })

  it('restores all spell slots', () => {
    const game = makeGame()
    game.longRest()
    expect(game.state.spellSlots.levels[0].used).toBe(0)
  })

  it('does not affect currency', () => {
    const game = makeGame()
    game.longRest()
    expect(game.state.currency.gp).toBe(10)
  })
})

describe('Game.cast', () => {
  it('uses a spell slot', () => {
    const game = makeGame()
    game.cast(1)
    expect(game.state.spellSlots.levels[0].used).toBe(2)
  })
})

describe('Game.regainSpellSlot', () => {
  it('regains a spell slot', () => {
    const game = makeGame()
    game.regainSpellSlot(1)
    expect(game.state.spellSlots.levels[0].used).toBe(0)
  })
})

describe('Game.setSpellLevels', () => {
  it('updates number of spell levels', () => {
    const game = makeGame()
    game.setSpellLevels(3)
    expect(game.state.spellSlots.levels.length).toBe(3)
  })
})

describe('Game.setTotalSpellSlots', () => {
  it('updates total for a level', () => {
    const game = makeGame()
    game.setTotalSpellSlots(1, 6)
    expect(game.state.spellSlots.levels[0].total).toBe(6)
  })
})

describe('Game.adjustCurrency', () => {
  it('adjusts currency amount', () => {
    const game = makeGame()
    game.adjustCurrency('gp', 5)
    expect(game.state.currency.gp).toBe(15)
  })
})

describe('Game.snapshot / restore', () => {
  it('restores a previous state', () => {
    const game = makeGame()
    const snap = game.snapshot()
    game.damage(10)
    game.restore(snap)
    expect(game.state.health.current).toBe(10)
  })
})
