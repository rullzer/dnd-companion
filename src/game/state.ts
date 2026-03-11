import type { Health } from "./health"
import type { SpellSlots } from "./spellslots"
import type { Currency } from "./currency"

export type State = {
  readonly name: string
  readonly health: Health
  readonly spellSlots: SpellSlots
  readonly currency: Currency
  readonly notes: string
}
