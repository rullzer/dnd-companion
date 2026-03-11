import { SpellSlots } from './game/spellslots';
import { Health } from './game/health';
import { Currency } from './game/currency';
import type { State } from './game/state';
import { createDefaultState } from './game/defaults';

const KEYS = {
  name: 'name',
  currentHealth: 'currentHealth',
  maximumHealth: 'maximumHealth',
  temporaryHealth: 'temporaryHealth',
  spellSlots: 'spellSlots',
  currency: 'currency',
} as const;

function loadNumber(key: string, fallback: number): number {
  const stored = localStorage.getItem(key)
  return stored !== null ? Number(stored) : fallback
}

export class GameStorage {
  public load(): State {
    const defaults = createDefaultState()

    const health = new Health(
      loadNumber(KEYS.currentHealth, defaults.health.maximum),
      loadNumber(KEYS.maximumHealth, defaults.health.maximum),
      loadNumber(KEYS.temporaryHealth, defaults.health.temporary),
    )

    let spellSlots: SpellSlots
    try {
      const stored = localStorage.getItem(KEYS.spellSlots)
      spellSlots = stored ? new SpellSlots(JSON.parse(stored)) : defaults.spellSlots
    } catch (e) {
      console.warn('Failed to parse stored spell slots, reverting to default', e)
      spellSlots = defaults.spellSlots
    }

    let currency: Currency
    try {
      const stored = localStorage.getItem(KEYS.currency)
      currency = stored ? new Currency(JSON.parse(stored)) : new Currency()
    } catch (e) {
      console.warn('Failed to parse stored currency, reverting to default', e)
      currency = new Currency()
    }

    const name = localStorage.getItem(KEYS.name) ?? ''

    return { name, health, spellSlots, currency }
  }

  public save(state: State): void {
    localStorage.setItem(KEYS.name, state.name)
    localStorage.setItem(KEYS.currentHealth, state.health.current.toString())
    localStorage.setItem(KEYS.maximumHealth, state.health.maximum.toString())
    localStorage.setItem(KEYS.temporaryHealth, state.health.temporary.toString())
    localStorage.setItem(KEYS.spellSlots, JSON.stringify(state.spellSlots.levels))
    localStorage.setItem(KEYS.currency, JSON.stringify({
      cp: state.currency.cp,
      sp: state.currency.sp,
      ep: state.currency.ep,
      gp: state.currency.gp,
      pp: state.currency.pp,
    }))
  }
}
