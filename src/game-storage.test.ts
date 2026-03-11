import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameStorage } from './game-storage'
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

describe('GameStorage.load defaults', () => {
  it('defaults name to empty string', () => {
    expect(new GameStorage().load().name).toBe('')
  })

  it('defaults health to 40/40', () => {
    const { health } = new GameStorage().load()
    expect(health.current).toBe(40)
    expect(health.maximum).toBe(40)
  })

  it('defaults spell slots to 2 levels', () => {
    expect(new GameStorage().load().spellSlots.levels.length).toBe(2)
  })

  it('defaults currency to all zero', () => {
    expect(new GameStorage().load().currency.totalInCp()).toBe(0)
  })
})

describe('GameStorage.save and load', () => {
  it('persists and restores name', () => {
    const storage = new GameStorage()
    const state = storage.load()
    storage.save({ ...state, name: 'Aria Swiftwind' })
    expect(new GameStorage().load().name).toBe('Aria Swiftwind')
  })

  it('persists and restores health', () => {
    const storage = new GameStorage()
    const state = storage.load()
    storage.save({ ...state, health: new Health(15, 30, 5) })
    const loaded = new GameStorage().load()
    expect(loaded.health.current).toBe(15)
    expect(loaded.health.maximum).toBe(30)
    expect(loaded.health.temporary).toBe(5)
  })

  it('persists and restores spell slots', () => {
    const storage = new GameStorage()
    const state = storage.load()
    storage.save({ ...state, spellSlots: new SpellSlots([{ total: 3, used: 1 }]) })
    const loaded = new GameStorage().load()
    expect(loaded.spellSlots.levels.length).toBe(1)
    expect(loaded.spellSlots.levels[0].total).toBe(3)
    expect(loaded.spellSlots.levels[0].used).toBe(1)
  })

  it('persists and restores currency', () => {
    const storage = new GameStorage()
    const state = storage.load()
    storage.save({ ...state, currency: new Currency({ gp: 5, pp: 2 }) })
    const loaded = new GameStorage().load()
    expect(loaded.currency.gp).toBe(5)
    expect(loaded.currency.pp).toBe(2)
  })
})

describe('GameStorage.load resilience', () => {
  it('falls back to default spell slots on corrupt data', () => {
    localStorage.setItem('spellSlots', 'not valid json{{{')
    const slots = new GameStorage().load().spellSlots
    expect(slots.levels.length).toBe(2)
  })

  it('falls back to empty currency on corrupt data', () => {
    localStorage.setItem('currency', 'not valid json{{{')
    const currency = new GameStorage().load().currency
    expect(currency.totalInCp()).toBe(0)
  })
})
