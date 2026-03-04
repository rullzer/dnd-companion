import type { Health } from "./health"
import type { SpellSlots } from "./spellslots"

export type State = {
  readonly health: Health
  readonly spellSlots: SpellSlots
}
