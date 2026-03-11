import { Health } from './health'
import { SpellSlots } from './spellslots'
import { Currency } from './currency'
import type { State } from './state'

export function createDefaultState(): State {
  return {
    name: '',
    health: new Health(40, 40),
    spellSlots: new SpellSlots([{ total: 4, used: 0 }, { total: 3, used: 0 }]),
    currency: new Currency(),
    notes: '',
  }
}
