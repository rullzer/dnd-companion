import { describe, it, expect } from 'vitest'
import { createDefaultState } from './defaults'

describe('createDefaultState', () => {
  it('has an empty name', () => {
    expect(createDefaultState().name).toBe('')
  })

  it('has health 40/40 with no temporary', () => {
    const { health } = createDefaultState()
    expect(health.current).toBe(40)
    expect(health.maximum).toBe(40)
    expect(health.temporary).toBe(0)
  })

  it('has 2 spell levels by default', () => {
    expect(createDefaultState().spellSlots.levels.length).toBe(2)
  })

  it('has no currency', () => {
    expect(createDefaultState().currency.totalInCp()).toBe(0)
  })
})
