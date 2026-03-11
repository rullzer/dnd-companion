import { describe, it, expect } from 'vitest'
import { createWizard, setName, submitName, setMaxHp, submitHp, setSpellLevels, setSpellSlotTotal, submitSpellSlots, isComplete } from './wizard'

function onNameStep() {
  return createWizard()
}

function onHpStep() {
  return submitName(setName(createWizard(), 'Aria'))
}

describe('createWizard', () => {
  it('starts on the name step', () => {
    expect(createWizard().step).toBe('name')
  })

  it('starts with empty name', () => {
    expect(createWizard().name).toBe('')
  })
})

describe('setName', () => {
  it('updates the name', () => {
    expect(setName(onNameStep(), 'Aria').name).toBe('Aria')
  })

  it('does not change the step', () => {
    expect(setName(onNameStep(), 'Aria').step).toBe('name')
  })

  it('does not mutate original', () => {
    const w = onNameStep()
    setName(w, 'Aria')
    expect(w.name).toBe('')
  })
})

describe('submitName', () => {
  it('advances to the hp step', () => {
    expect(onHpStep().step).toBe('hp')
  })

  it('preserves the name', () => {
    expect(onHpStep().name).toBe('Aria')
  })
})

describe('setMaxHp', () => {
  it('updates maxHp', () => {
    expect(setMaxHp(onHpStep(), 30).maxHp).toBe(30)
  })

  it('does not change the step', () => {
    expect(setMaxHp(onHpStep(), 30).step).toBe('hp')
  })

  it('does not mutate original', () => {
    const w = onHpStep()
    setMaxHp(w, 30)
    expect(w.maxHp).toBe(1)
  })
})

describe('submitHp', () => {
  it('advances to the spellSlots step', () => {
    expect(submitHp(setMaxHp(onHpStep(), 30)).step).toBe('spellSlots')
  })

  it('preserves name and maxHp', () => {
    const w = submitHp(setMaxHp(onHpStep(), 30))
    expect(w.name).toBe('Aria')
    expect(w.maxHp).toBe(30)
  })
})

function onSpellSlotsStep() {
  return submitHp(setMaxHp(onHpStep(), 30))
}

describe('setSpellLevels', () => {
  it('updates the number of spell levels', () => {
    expect(setSpellLevels(onSpellSlotsStep(), 3).spellLevels).toBe(3)
  })

  it('does not change the step', () => {
    expect(setSpellLevels(onSpellSlotsStep(), 3).step).toBe('spellSlots')
  })

  it('extends spellSlotTotals with default 1 when adding levels', () => {
    expect(setSpellLevels(onSpellSlotsStep(), 2).spellSlotTotals).toHaveLength(2)
  })

  it('trims spellSlotTotals when reducing levels', () => {
    const w = setSpellLevels(setSpellLevels(onSpellSlotsStep(), 3), 1)
    expect(w.spellSlotTotals).toHaveLength(1)
  })
})

describe('setSpellSlotTotal', () => {
  it('updates total for a given level index', () => {
    const w = setSpellLevels(onSpellSlotsStep(), 2)
    expect(setSpellSlotTotal(w, 0, 4).spellSlotTotals[0]).toBe(4)
  })

  it('does not affect other levels', () => {
    const w = setSpellLevels(onSpellSlotsStep(), 2)
    expect(setSpellSlotTotal(w, 0, 4).spellSlotTotals[1]).toBe(1)
  })
})

describe('submitSpellSlots', () => {
  it('advances to the done step', () => {
    expect(submitSpellSlots(onSpellSlotsStep()).step).toBe('done')
  })

  it('preserves all data', () => {
    const w = submitSpellSlots(setSpellLevels(onSpellSlotsStep(), 2))
    expect(w.name).toBe('Aria')
    expect(w.maxHp).toBe(30)
    expect(w.spellLevels).toBe(2)
  })
})

describe('isComplete', () => {
  it('returns false on the name step', () => {
    expect(isComplete(onNameStep())).toBe(false)
  })

  it('returns false on the hp step', () => {
    expect(isComplete(onHpStep())).toBe(false)
  })

  it('returns false on the spellSlots step', () => {
    expect(isComplete(onSpellSlotsStep())).toBe(false)
  })

  it('returns true on the done step', () => {
    expect(isComplete(submitSpellSlots(onSpellSlotsStep()))).toBe(true)
  })
})
