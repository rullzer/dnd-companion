import { html } from 'lit-html'
import { live } from 'lit-html/directives/live.js'

export const renderSetup = (
  name: string,
  onNameInput: (name: string) => void,
  onSubmit: () => void,
) => html`
  <div class="setup-screen">
    <h1>DND Companion</h1>
    <p class="setup-subtitle">Let's get started. What's your character's name?</p>
    <form class="setup-form" @submit=${(e: Event) => { e.preventDefault(); onSubmit() }}>
      <input
        class="setup-name-input"
        type="text"
        placeholder="Character name"
        .value=${live(name)}
        @input=${(e: Event) => onNameInput((e.target as HTMLInputElement).value)}
        autocomplete="off"
        autofocus
      />
      <button type="submit" ?disabled=${name.trim() === ''}>Begin Adventure</button>
    </form>
  </div>
`
