import { describe, it, expect, beforeEach, vi } from 'vitest'
import { App } from './app'
import { GameStorage } from './game-storage'
import { createInitialAppState } from './app-state'
import { Health } from './game/health'
import { SpellSlots } from './game/spellslots'
import { Currency } from './game/currency'
import type { State } from './game/state'

function makeLocalStorageMock() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeLocalStorageMock())
})

function makeState(): State {
  return {
    name: 'Aria',
    health: new Health(10, 20),
    spellSlots: new SpellSlots([{ total: 4, used: 1 }]),
    currency: new Currency({ gp: 10 }),
    notes: '',
  }
}

function makeApp() {
  return new App(makeState(), new GameStorage(), createInitialAppState())
}

function makeUnnamedApp() {
  return new App(
    { name: '', health: new Health(10, 20), spellSlots: new SpellSlots([]), currency: new Currency(), notes: '' },
    new GameStorage(),
    createInitialAppState(),
  )
}

describe('App.needsSetup', () => {
  it('returns true when name is empty', () => {
    expect(makeUnnamedApp().needsSetup()).toBe(true)
  })

  it('returns false when name is set', () => {
    expect(makeApp().needsSetup()).toBe(false)
  })
})

describe('App.completeSetup', () => {
  it('sets the name', () => {
    expect(makeUnnamedApp().completeSetup('Aria', 20, []).gameState.name).toBe('Aria')
  })

  it('sets maximum health', () => {
    expect(makeUnnamedApp().completeSetup('Aria', 20, []).gameState.health.maximum).toBe(20)
  })

  it('sets current health to maximum', () => {
    expect(makeUnnamedApp().completeSetup('Aria', 20, []).gameState.health.current).toBe(20)
  })

  it('sets spell slots from totals', () => {
    const app = makeUnnamedApp().completeSetup('Aria', 20, [4, 3])
    expect(app.gameState.spellSlots.levels).toHaveLength(2)
    expect(app.gameState.spellSlots.levels[0].total).toBe(4)
    expect(app.gameState.spellSlots.levels[0].used).toBe(0)
  })

  it('saves to storage', () => {
    const storage = new GameStorage()
    const app = new App(
      { name: '', health: new Health(10, 20), spellSlots: new SpellSlots([]), currency: new Currency(), notes: '' },
      storage,
      createInitialAppState(),
    )
    app.completeSetup('Aria', 30, [])
    expect(storage.load().name).toBe('Aria')
  })

  it('needsSetup returns false after completeSetup', () => {
    expect(makeUnnamedApp().completeSetup('Aria', 20, []).needsSetup()).toBe(false)
  })
})

describe('App.openConfig', () => {
  it('sets isConfigOpen to true', () => {
    expect(makeApp().openConfig().state.isConfigOpen).toBe(true)
  })

  it('captures a snapshot of game state', () => {
    const app = makeApp().openConfig()
    expect(app.state.configSnapshot?.name).toBe('Aria')
  })
})

describe('App.cancelConfig', () => {
  it('sets isConfigOpen to false', () => {
    const app = makeApp().openConfig().cancelConfig()
    expect(app.state.isConfigOpen).toBe(false)
  })

  it('restores game state to snapshot', () => {
    const app = makeApp().openConfig()
    const modified = app.setMaximumHealth(99)
    const cancelled = modified.cancelConfig()
    expect(cancelled.gameState.health.maximum).toBe(20)
  })

  it('clears the snapshot', () => {
    const app = makeApp().openConfig().cancelConfig()
    expect(app.state.configSnapshot).toBeNull()
  })
})

describe('App.saveConfig', () => {
  it('sets isConfigOpen to false', () => {
    expect(makeApp().openConfig().saveConfig().state.isConfigOpen).toBe(false)
  })

  it('clears the snapshot', () => {
    expect(makeApp().openConfig().saveConfig().state.configSnapshot).toBeNull()
  })
})

describe('App.openHpModal', () => {
  it('sets initial amount to 1 for damage', () => {
    expect(makeApp().openHpModal('damage').state.hpModal?.amount).toBe(1)
  })

  it('sets initial amount to 1 for heal', () => {
    expect(makeApp().openHpModal('heal').state.hpModal?.amount).toBe(1)
  })

  it('sets initial amount to current temporary hp for temp', () => {
    const app = new App(
      { name: 'Aria', health: new Health(10, 20, 5), spellSlots: new SpellSlots([]), currency: new Currency(), notes: '' },
      new GameStorage(),
      createInitialAppState(),
    )
    expect(app.openHpModal('temp').state.hpModal?.amount).toBe(5)
  })
})

describe('App.confirmHpModal', () => {
  it('applies damage to health', () => {
    const app = makeApp().openHpModal('damage').setHpAmount(3).confirmHpModal()
    expect(app.gameState.health.current).toBe(7)
  })

  it('applies heal to health', () => {
    const app = makeApp().openHpModal('heal').setHpAmount(4).confirmHpModal()
    expect(app.gameState.health.current).toBe(14)
  })

  it('sets temporary hp', () => {
    const app = makeApp().openHpModal('temp').setHpAmount(6).confirmHpModal()
    expect(app.gameState.health.temporary).toBe(6)
  })

  it('closes the modal', () => {
    const app = makeApp().openHpModal('damage')
    expect(app.confirmHpModal().state.hpModal).toBeNull()
  })

  it('does nothing when no modal is open', () => {
    const app = makeApp()
    expect(app.confirmHpModal().gameState.health.current).toBe(10)
  })
})

describe('App.longRest', () => {
  it('restores health to maximum', () => {
    expect(makeApp().longRest().gameState.health.current).toBe(20)
  })

  it('restores spell slots', () => {
    expect(makeApp().longRest().gameState.spellSlots.levels[0].used).toBe(0)
  })

  it('saves to storage', () => {
    const storage = new GameStorage()
    const app = new App(makeState(), storage, createInitialAppState())
    const next = app.longRest()
    expect(storage.load().health.current).toBe(next.gameState.health.current)
  })
})

describe('App.cast', () => {
  it('uses a spell slot', () => {
    expect(makeApp().cast(1).gameState.spellSlots.levels[0].used).toBe(2)
  })

  it('saves to storage', () => {
    const storage = new GameStorage()
    const app = new App(makeState(), storage, createInitialAppState())
    app.cast(1)
    expect(storage.load().spellSlots.levels[0].used).toBe(2)
  })
})

describe('App.regainSpellSlot', () => {
  it('regains a spell slot', () => {
    expect(makeApp().regainSpellSlot(1).gameState.spellSlots.levels[0].used).toBe(0)
  })

  it('saves to storage', () => {
    const storage = new GameStorage()
    const app = new App(makeState(), storage, createInitialAppState())
    app.regainSpellSlot(1)
    expect(storage.load().spellSlots.levels[0].used).toBe(0)
  })
})

describe('App.adjustCurrency', () => {
  it('adjusts currency', () => {
    expect(makeApp().adjustCurrency('gp', 5).gameState.currency.gp).toBe(15)
  })

  it('saves to storage', () => {
    const storage = new GameStorage()
    const app = new App(makeState(), storage, createInitialAppState())
    app.adjustCurrency('gp', 5)
    expect(storage.load().currency.gp).toBe(15)
  })
})

describe('App.setName', () => {
  it('updates name', () => {
    expect(makeApp().setName('Thorin').gameState.name).toBe('Thorin')
  })
})

describe('App.setMaximumHealth', () => {
  it('updates maximum health', () => {
    expect(makeApp().setMaximumHealth(30).gameState.health.maximum).toBe(30)
  })
})

describe('App.setSpellLevels', () => {
  it('updates number of spell levels', () => {
    expect(makeApp().setSpellLevels(3).gameState.spellSlots.levels).toHaveLength(3)
  })
})

describe('App.setTotalSpellSlots', () => {
  it('updates total for a level', () => {
    expect(makeApp().setTotalSpellSlots(1, 6).gameState.spellSlots.levels[0].total).toBe(6)
  })
})

describe('App.roll', () => {
  it('adds a result to dice history', () => {
    const app = makeApp().openDiceModal().roll(20)
    expect(app.state.diceHistory).toHaveLength(1)
    expect(app.state.diceHistory[0].die).toBe(20)
  })

  it('closes the dice modal', () => {
    expect(makeApp().openDiceModal().roll(6).state.isDiceModalOpen).toBe(false)
  })
})
