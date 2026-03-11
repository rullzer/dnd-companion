import { html } from 'lit-html'
import { live } from 'lit-html/directives/live.js'
import type { Wizard } from '../wizard'
import { setSpellLevels, setSpellSlotTotal } from '../wizard'

export const renderWizard = (
  wizard: Wizard,
  onChange: (wizard: Wizard) => void,
  onComplete: () => void,
) => {
  if (wizard.step === 'name') return html`
    <div class="setup-screen">
      <h1>DND Companion</h1>
      <p class="setup-subtitle">Let's get started. What's your character's name?</p>
      <form class="setup-form" @submit=${(e: Event) => {
        e.preventDefault()
        onChange({ ...wizard, step: 'hp' })
      }}>
        <input
          class="setup-name-input"
          type="text"
          placeholder="Character name"
          .value=${live(wizard.name)}
          @input=${(e: Event) => onChange({ ...wizard, name: (e.target as HTMLInputElement).value })}
          autocomplete="off"
          autofocus
        />
        <button type="submit" ?disabled=${wizard.name.trim() === ''}>Next</button>
      </form>
    </div>
  `

  if (wizard.step === 'hp') return html`
    <div class="setup-screen">
      <h1>How much HP does ${wizard.name} have?</h1>
      <div class="setup-form">
        <div class="stepper setup-stepper">
          <button ?disabled=${wizard.maxHp <= 1} @click=${() => onChange({ ...wizard, maxHp: wizard.maxHp - 1 })}>-</button>
          <span>${wizard.maxHp}</span>
          <button @click=${() => onChange({ ...wizard, maxHp: wizard.maxHp + 1 })}>+</button>
        </div>
        <button @click=${() => onChange({ ...wizard, step: 'spellSlots' })}>Next</button>
      </div>
    </div>
  `

  return html`
    <div class="setup-screen">
      <h1>Does ${wizard.name} have spell slots?</h1>
      <div class="setup-form">
        <div class="stepper setup-stepper">
          <button ?disabled=${wizard.spellLevels <= 0} @click=${() => onChange(setSpellLevels(wizard, wizard.spellLevels - 1))}>-</button>
          <span>${wizard.spellLevels} level${wizard.spellLevels === 1 ? '' : 's'}</span>
          <button ?disabled=${wizard.spellLevels >= 9} @click=${() => onChange(setSpellLevels(wizard, wizard.spellLevels + 1))}>+</button>
        </div>
        ${wizard.spellLevels > 0 ? html`
          <div class="config-slots-grid">
            ${wizard.spellSlotTotals.map((total, i) => html`
              <div class="config-slot-item">
                <label>Level ${i + 1}</label>
                <div class="stepper">
                  <button ?disabled=${total <= 1} @click=${() => onChange(setSpellSlotTotal(wizard, i, total - 1))}>-</button>
                  <span>${total}</span>
                  <button @click=${() => onChange(setSpellSlotTotal(wizard, i, total + 1))}>+</button>
                </div>
              </div>
            `)}
          </div>
        ` : ''}
        <button @click=${onComplete}>Begin Adventure</button>
      </div>
    </div>
  `
}
