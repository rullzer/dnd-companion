import type { Health } from "./health"
import type { SpellSlots } from "./spellslots"
import type { Currency } from "./currency"

export type State = {
  readonly health: Health
  readonly spellSlots: SpellSlots
  readonly currency: Currency
}
