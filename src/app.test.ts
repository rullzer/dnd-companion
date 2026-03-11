import { describe, it, expect, beforeEach, vi } from 'vitest'
import { App } from './app'
import { Game } from './game'
import { GameStorage } from './game-storage'
import { createInitialAppState } from './app-state'
import { Health } from './game/health'
import { SpellSlots } from './game/spellslots'
import { Currency } from './game/currency'

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

function makeApp() {
  const game = new Game({
    name: 'Aria',
    health: new Health(10, 20),
    spellSlots: new SpellSlots([{ total: 4, used: 1 }]),
    currency: new Currency({ gp: 10 }),
  })
  return new App(game, new GameStorage(), createInitialAppState())
}

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
    app.game.setMaximumHealth(99)
    app.cancelConfig()
    expect(app.game.state.health.maximum).toBe(20)
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
    const game = new Game({
      name: 'Aria',
      health: new Health(10, 20, 5),
      spellSlots: new SpellSlots([]),
      currency: new Currency(),
    })
    const app = new App(game, new GameStorage(), createInitialAppState())
    expect(app.openHpModal('temp').state.hpModal?.amount).toBe(5)
  })
})

describe('App.confirmHpModal', () => {
  it('applies damage to health', () => {
    const app = makeApp().openHpModal('damage')
    app.state.hpModal && (app.state.hpModal.amount = 3)
    app.confirmHpModal()
    expect(app.game.state.health.current).toBe(7)
  })

  it('applies heal to health', () => {
    const app = makeApp().openHpModal('heal')
    app.state.hpModal && (app.state.hpModal.amount = 4)
    app.confirmHpModal()
    expect(app.game.state.health.current).toBe(14)
  })

  it('sets temporary hp', () => {
    const app = makeApp().openHpModal('temp')
    app.state.hpModal && (app.state.hpModal.amount = 6)
    app.confirmHpModal()
    expect(app.game.state.health.temporary).toBe(6)
  })

  it('closes the modal', () => {
    const app = makeApp().openHpModal('damage')
    expect(app.confirmHpModal().state.hpModal).toBeNull()
  })

  it('does nothing when no modal is open', () => {
    const app = makeApp()
    expect(app.confirmHpModal().game.state.health.current).toBe(10)
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
