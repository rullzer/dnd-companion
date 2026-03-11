import { describe, it, expect } from 'vitest'
import { createInitialAppState, setHpAmount, addRollToHistory } from './app-state'
import type { DiceResult } from './game/dice'

const roll = (die: DiceResult['die'], total: number): DiceResult => ({ die, roll: total, total })

describe('createInitialAppState', () => {
  it('starts with no modals open', () => {
    const app = createInitialAppState()
    expect(app.isConfigOpen).toBe(false)
    expect(app.isDiceModalOpen).toBe(false)
    expect(app.hpModal).toBeNull()
    expect(app.confirmModal).toBeNull()
  })

  it('starts with empty dice history', () => {
    expect(createInitialAppState().diceHistory).toEqual([])
  })
})

describe('setHpAmount', () => {
  it('updates hpModal amount when modal is open', () => {
    const app = { ...createInitialAppState(), hpModal: { type: 'damage' as const, amount: 1 } }
    const next = setHpAmount(app, 5)
    expect(next.hpModal?.amount).toBe(5)
  })

  it('does nothing when hpModal is null', () => {
    const app = createInitialAppState()
    const next = setHpAmount(app, 5)
    expect(next.hpModal).toBeNull()
  })

  it('does not mutate original state', () => {
    const app = { ...createInitialAppState(), hpModal: { type: 'heal' as const, amount: 1 } }
    setHpAmount(app, 10)
    expect(app.hpModal?.amount).toBe(1)
  })
})

describe('addRollToHistory', () => {
  it('adds a roll to empty history', () => {
    const app = createInitialAppState()
    const next = addRollToHistory(app, roll(20, 15))
    expect(next.diceHistory).toHaveLength(1)
    expect(next.diceHistory[0].total).toBe(15)
  })

  it('prepends the roll', () => {
    const app = { ...createInitialAppState(), diceHistory: [roll(6, 3)] }
    const next = addRollToHistory(app, roll(20, 18))
    expect(next.diceHistory[0].die).toBe(20)
  })

  it('caps history at 5', () => {
    const app = {
      ...createInitialAppState(),
      diceHistory: [roll(4,1), roll(6,2), roll(8,3), roll(10,4), roll(12,5)],
    }
    expect(addRollToHistory(app, roll(20, 6)).diceHistory).toHaveLength(5)
  })

  it('does not mutate original state', () => {
    const app = createInitialAppState()
    addRollToHistory(app, roll(20, 15))
    expect(app.diceHistory).toHaveLength(0)
  })
})
