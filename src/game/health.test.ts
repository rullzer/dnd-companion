import { describe, it, expect } from 'vitest'
import { Health } from './health'

describe('Health constructor', () => {
  it('clamps current to [0, maximum]', () => {
    expect(new Health(15, 10).current).toBe(10)
    expect(new Health(-5, 10).current).toBe(0)
    expect(new Health(5, 10).current).toBe(5)
  })

  it('clamps maximum to >= 0', () => {
    expect(new Health(5, -1).maximum).toBe(0)
  })

  it('clamps temporary to >= 0', () => {
    expect(new Health(10, 10, -5).temporary).toBe(0)
  })

  it('defaults temporary to 0', () => {
    expect(new Health(10, 10).temporary).toBe(0)
  })
})

describe('Health.decrease', () => {
  it('reduces current hp by delta', () => {
    const h = new Health(10, 10).decrease(3)
    expect(h.current).toBe(7)
  })

  it('does not go below 0', () => {
    const h = new Health(5, 10).decrease(10)
    expect(h.current).toBe(0)
  })

  it('temporary hp absorbs damage first', () => {
    const h = new Health(10, 10, 5).decrease(3)
    expect(h.temporary).toBe(2)
    expect(h.current).toBe(10)
  })

  it('damage overflows from temporary to current', () => {
    const h = new Health(10, 10, 3).decrease(5)
    expect(h.temporary).toBe(0)
    expect(h.current).toBe(8)
  })

  it('throws on negative delta', () => {
    expect(() => new Health(10, 10).decrease(-1)).toThrow()
  })
})

describe('Health.increase', () => {
  it('increases current hp', () => {
    const h = new Health(5, 10).increase(3)
    expect(h.current).toBe(8)
  })

  it('does not exceed maximum', () => {
    const h = new Health(8, 10).increase(5)
    expect(h.current).toBe(10)
  })

  it('throws on negative delta', () => {
    expect(() => new Health(10, 10).increase(-1)).toThrow()
  })

  it('does not affect temporary hp', () => {
    const h = new Health(5, 10, 3).increase(2)
    expect(h.temporary).toBe(3)
  })
})

describe('Health.setMaximum', () => {
  it('updates maximum', () => {
    const h = new Health(10, 10).setMaximum(15)
    expect(h.maximum).toBe(15)
  })

  it('clamps current when maximum is reduced below it', () => {
    const h = new Health(10, 10).setMaximum(6)
    expect(h.current).toBe(6)
  })
})

describe('Health.setTemporary', () => {
  it('sets temporary hp', () => {
    const h = new Health(10, 10).setTemporary(5)
    expect(h.temporary).toBe(5)
  })
})

describe('Health.restore', () => {
  it('restores current to maximum', () => {
    const h = new Health(3, 10).restore()
    expect(h.current).toBe(10)
  })

  it('clears temporary hp', () => {
    const h = new Health(5, 10, 4).restore()
    expect(h.temporary).toBe(0)
  })
})
