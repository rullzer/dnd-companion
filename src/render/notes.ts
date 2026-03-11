import { html } from 'lit-html'
import { live } from 'lit-html/directives/live.js'

export const renderNotes = (notes: string, onInput: (notes: string) => void) => html`
  <div class="notes-section">
    <h2>Notes</h2>
    <textarea
      class="notes-textarea"
      placeholder="Jot down what happened this session..."
      .value=${live(notes)}
      @input=${(e: Event) => onInput((e.target as HTMLTextAreaElement).value)}
    ></textarea>
  </div>
`
