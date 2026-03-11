import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Game } from './game'

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

describe('Game name', () => {
  it('defaults to empty string when nothing is stored', () => {
    const game = Game.createInitial()
    expect(game.state.name).toBe('')
  })

  it('saves and restores the name', () => {
    const game = Game.createInitial()
    game.setName('Aria Swiftwind')
    game.save()

    const loaded = Game.createInitial()
    expect(loaded.state.name).toBe('Aria Swiftwind')
  })

  it('setName updates state', () => {
    const game = Game.createInitial()
    game.setName('Thorin')
    expect(game.state.name).toBe('Thorin')
  })
})
