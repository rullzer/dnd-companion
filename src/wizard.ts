export type WizardStep = 'name' | 'hp' | 'spellSlots' | 'done'

export type Wizard = {
  readonly step: WizardStep
  readonly name: string
  readonly maxHp: number
  readonly spellLevels: number
  readonly spellSlotTotals: number[]
}

export function createWizard(): Wizard {
  return { step: 'name', name: '', maxHp: 1, spellLevels: 0, spellSlotTotals: [] }
}

export function setName(wizard: Wizard, name: string): Wizard {
  return { ...wizard, name }
}

export function submitName(wizard: Wizard): Wizard {
  return { ...wizard, step: 'hp' }
}

export function setMaxHp(wizard: Wizard, maxHp: number): Wizard {
  return { ...wizard, maxHp }
}

export function submitHp(wizard: Wizard): Wizard {
  return { ...wizard, step: 'spellSlots' }
}

export function setSpellLevels(wizard: Wizard, spellLevels: number): Wizard {
  const current = wizard.spellSlotTotals
  const spellSlotTotals = Array.from({ length: spellLevels }, (_, i) => current[i] ?? 1)
  return { ...wizard, spellLevels, spellSlotTotals }
}

export function setSpellSlotTotal(wizard: Wizard, index: number, total: number): Wizard {
  const spellSlotTotals = wizard.spellSlotTotals.map((t, i) => i === index ? total : t)
  return { ...wizard, spellSlotTotals }
}

export function submitSpellSlots(wizard: Wizard): Wizard {
  return { ...wizard, step: 'done' }
}

export function isComplete(wizard: Wizard): boolean {
  return wizard.step === 'done'
}
