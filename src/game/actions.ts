import type { State } from './state'
import type { CurrencyType } from './currency'

export function setName(state: State, name: string): State {
  return { ...state, name }
}

export function damage(state: State, delta: number): State {
  return { ...state, health: state.health.decrease(delta) }
}

export function heal(state: State, delta: number): State {
  return { ...state, health: state.health.increase(delta) }
}

export function setMaximumHealth(state: State, value: number): State {
  return { ...state, health: state.health.setMaximum(value) }
}

export function setTemporaryHealth(state: State, value: number): State {
  return { ...state, health: state.health.setTemporary(value) }
}

export function longRest(state: State): State {
  return { ...state, health: state.health.restore(), spellSlots: state.spellSlots.restoreAll() }
}

export function cast(state: State, level: number): State {
  return { ...state, spellSlots: state.spellSlots.cast(level) }
}

export function regainSpellSlot(state: State, level: number): State {
  return { ...state, spellSlots: state.spellSlots.regain(level) }
}

export function setSpellLevels(state: State, count: number): State {
  return { ...state, spellSlots: state.spellSlots.setLevels(count) }
}

export function setTotalSpellSlots(state: State, level: number, total: number): State {
  return { ...state, spellSlots: state.spellSlots.setTotal(level, total) }
}

export function adjustCurrency(state: State, type: CurrencyType, delta: number): State {
  return { ...state, currency: state.currency.adjust(type, delta) }
}

export function setCurrency(state: State, type: CurrencyType, value: number): State {
  return { ...state, currency: state.currency.set(type, value) }
}

export function setNotes(state: State, notes: string): State {
  return { ...state, notes }
}
