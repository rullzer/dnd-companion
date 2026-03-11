import { SpellSlots, type SpellLevel } from './game/spellslots';
import { Health } from './game/health';
import { Currency } from './game/currency';
import type { State } from './game/state';

const DEFAULT_SLOTS: SpellLevel[] = [
  { total: 4, used: 0 }, { total: 3, used: 0 },
];

function loadNumber(key: string, fallback: number): number {
  const stored = localStorage.getItem(key)
  return stored !== null ? Number(stored) : fallback
}

export class GameStorage {
  public load(): State {
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

    return { name, health, spellSlots, currency }
  }

  public save(state: State): void {
    localStorage.setItem('name', state.name)
    localStorage.setItem('currentHealth', state.health.current.toString())
    localStorage.setItem('maximumHealth', state.health.maximum.toString())
    localStorage.setItem('temporaryHealth', state.health.temporary.toString())
    localStorage.setItem('spellSlots', JSON.stringify(state.spellSlots.levels))
    localStorage.setItem('currency', JSON.stringify({
      cp: state.currency.cp,
      sp: state.currency.sp,
      ep: state.currency.ep,
      gp: state.currency.gp,
      pp: state.currency.pp,
    }))
  }
}
