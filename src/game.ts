import { SpellSlots, type SpellLevel } from './game/spellslots';
import type { State } from './game/state'
import { Health } from './game/health';
import { Currency, type CurrencyType } from './game/currency';

function loadNumber(key: string, fallback: number): number {
  const stored = localStorage.getItem(key)
  return stored !== null ? Number(stored) : fallback
}

const DEFAULT_SLOTS: SpellLevel[] = [
  { total: 4, used: 0 }, { total: 3, used: 0 },
];

export class Game {
  private _state: State

  public get state(): State {
    return this._state
  }

  public constructor(state: State) {
    this._state = state
  }

  public cast(level: number): void {
    this._state = { ...this._state, spellSlots: this._state.spellSlots.cast(level) }
  }

  public damage(delta: number): void {
    this._state = { ...this._state, health: this._state.health.decrease(delta) }
  }

  public heal(delta: number): void {
    this._state = { ...this._state, health: this._state.health.increase(delta) }
  }

  public regainSpellSlot(level: number): void {
    this._state = { ...this._state, spellSlots: this._state.spellSlots.regain(level) }
  }

  public longRest(): void {
    this._state = {
      ...this._state,
      health: this._state.health.restore(),
      spellSlots: this._state.spellSlots.restoreAll(),
    }
  }

  public adjustCurrency(type: CurrencyType, delta: number): void {
    this._state = { ...this._state, currency: this._state.currency.adjust(type, delta) }
  }

  public setName(name: string): void {
    this._state = { ...this._state, name }
  }

  public save(): void {
    localStorage.setItem('name', this.state.name)
    localStorage.setItem('currentHealth', this.state.health.current.toString())
    localStorage.setItem('maximumHealth', this.state.health.maximum.toString())
    localStorage.setItem('temporaryHealth', this.state.health.temporary.toString())
    localStorage.setItem('spellSlots', JSON.stringify(this.state.spellSlots.levels))
    localStorage.setItem('currency', JSON.stringify({
      cp: this.state.currency.cp,
      sp: this.state.currency.sp,
      ep: this.state.currency.ep,
      gp: this.state.currency.gp,
      pp: this.state.currency.pp,
    }))
  }

  public snapshot(): State {
    return { ...this._state }
  }

  public restore(state: State): void {
    this._state = state
  }

  public setMaximumHealth(value: number): void {
    this._state = { ...this._state, health: this._state.health.setMaximum(value) }
  }

  public setTemporaryHealth(value: number): void {
    this._state = { ...this._state, health: this._state.health.setTemporary(value) }
  }

  public setSpellLevels(levels: number): void {
    this._state = { ...this._state, spellSlots: this._state.spellSlots.setLevels(levels) }
  }

  public setTotalSpellSlots(level: number, total: number): void {
    this._state = { ...this._state, spellSlots: this._state.spellSlots.setTotal(level, total) }
  }

  public static createInitial(): Game {
    const health = new Health(
      loadNumber('currentHealth', 40),
      loadNumber('maximumHealth', 40),
      loadNumber('temporaryHealth', 0),
    )
    
    let spellSlots: SpellSlots

    try {
      const stored = localStorage.getItem('spellSlots')
      spellSlots = stored ? new SpellSlots(JSON.parse(stored)) : new SpellSlots(DEFAULT_SLOTS)
    } catch (e) {
      console.warn('Failed to parse stored spell slots, reverting to default', e)
      spellSlots = new SpellSlots(DEFAULT_SLOTS)
    }

    let currency: Currency

    try {
      const stored = localStorage.getItem('currency')
      currency = stored ? new Currency(JSON.parse(stored)) : new Currency()
    } catch (e) {
      console.warn('Failed to parse stored currency, reverting to default', e)
      currency = new Currency()
    }

    const name = localStorage.getItem('name') ?? ''

    return new Game({
      name,
      health,
      spellSlots,
      currency,
    })
  }
}
