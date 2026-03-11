import { describe, it, expect } from 'vitest'
import { Currency } from './currency'

describe('Currency constructor', () => {
  it('defaults all amounts to 0', () => {
    const c = new Currency()
    expect(c.cp).toBe(0)
    expect(c.sp).toBe(0)
    expect(c.ep).toBe(0)
    expect(c.gp).toBe(0)
    expect(c.pp).toBe(0)
  })

  it('clamps negative values to 0', () => {
    const c = new Currency({ gp: -10 })
    expect(c.gp).toBe(0)
  })

  it('accepts partial amounts', () => {
    const c = new Currency({ gp: 5, pp: 2 })
    expect(c.gp).toBe(5)
    expect(c.pp).toBe(2)
    expect(c.cp).toBe(0)
  })
})

describe('Currency.adjust', () => {
  it('increases a currency amount', () => {
    const c = new Currency({ gp: 10 }).adjust('gp', 5)
    expect(c.gp).toBe(15)
  })

  it('decreases a currency amount', () => {
    const c = new Currency({ sp: 10 }).adjust('sp', -3)
    expect(c.sp).toBe(7)
  })

  it('clamps result to 0', () => {
    const c = new Currency({ cp: 2 }).adjust('cp', -10)
    expect(c.cp).toBe(0)
  })

  it('does not affect other currency types', () => {
    const c = new Currency({ gp: 5, pp: 2 }).adjust('gp', 3)
    expect(c.pp).toBe(2)
  })
})

describe('Currency.totalInCp', () => {
  it('returns 0 for empty currency', () => {
    expect(new Currency().totalInCp()).toBe(0)
  })

  it('converts pp correctly (1 pp = 1000 cp)', () => {
    expect(new Currency({ pp: 1 }).totalInCp()).toBe(1000)
  })

  it('converts gp correctly (1 gp = 100 cp)', () => {
    expect(new Currency({ gp: 1 }).totalInCp()).toBe(100)
  })

  it('converts ep correctly (1 ep = 50 cp)', () => {
    expect(new Currency({ ep: 1 }).totalInCp()).toBe(50)
  })

  it('converts sp correctly (1 sp = 10 cp)', () => {
    expect(new Currency({ sp: 1 }).totalInCp()).toBe(10)
  })

  it('sums all currencies', () => {
    const c = new Currency({ cp: 1, sp: 1, ep: 1, gp: 1, pp: 1 })
    expect(c.totalInCp()).toBe(1 + 10 + 50 + 100 + 1000)
  })
})
