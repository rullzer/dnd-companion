import type { State } from './game/state'
import type { CurrencyType } from './game/currency';

export class Game {
  private _state: State

  public get state(): State {
    return this._state
  }

  public constructor(state: State) {
    this._state = state
  }

  public setName(name: string): void {
    this._state = { ...this._state, name }
  }

  public damage(delta: number): void {
    this._state = { ...this._state, health: this._state.health.decrease(delta) }
  }

  public heal(delta: number): void {
    this._state = { ...this._state, health: this._state.health.increase(delta) }
  }

  public setMaximumHealth(value: number): void {
    this._state = { ...this._state, health: this._state.health.setMaximum(value) }
  }

  public setTemporaryHealth(value: number): void {
    this._state = { ...this._state, health: this._state.health.setTemporary(value) }
  }

  public longRest(): void {
    this._state = {
      ...this._state,
      health: this._state.health.restore(),
      spellSlots: this._state.spellSlots.restoreAll(),
    }
  }

  public cast(level: number): void {
    this._state = { ...this._state, spellSlots: this._state.spellSlots.cast(level) }
  }

  public regainSpellSlot(level: number): void {
    this._state = { ...this._state, spellSlots: this._state.spellSlots.regain(level) }
  }

  public setSpellLevels(levels: number): void {
    this._state = { ...this._state, spellSlots: this._state.spellSlots.setLevels(levels) }
  }

  public setTotalSpellSlots(level: number, total: number): void {
    this._state = { ...this._state, spellSlots: this._state.spellSlots.setTotal(level, total) }
  }

  public adjustCurrency(type: CurrencyType, delta: number): void {
    this._state = { ...this._state, currency: this._state.currency.adjust(type, delta) }
  }

  public snapshot(): State {
    return { ...this._state }
  }

  public restore(state: State): void {
    this._state = state
  }
}
