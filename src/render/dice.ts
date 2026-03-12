import { html } from 'lit-html';
import { DICE, type Die, type DiceResult } from '../game/dice';

export const renderDiceModal = (
  history: DiceResult[],
  onRoll: (die: Die) => void,
  onClose: () => void,
) => html`
  <div class="dice-modal">
    <div class="config-content">
      <h3>Dice</h3>
      <div class="dice-history">
        ${history.length === 0
          ? html`<span class="dice-history-empty">No rolls yet</span>`
          : history.map((result, i) => html`
              <div class="dice-history-row ${i === 0 ? 'latest' : ''}">
                <div class="dice-history-left">
                  <span class="dice-history-die">d${result.die}</span>
                  ${i === 0 ? html`<span class="dice-history-badge">latest</span>` : ''}
                </div>
                <span class="dice-history-total">${result.total}</span>
              </div>
            `)
        }
      </div>
      <div class="dice-buttons">
        ${DICE.map(die => html`
          <button class="die-btn" @click=${() => onRoll(die)}>d${die}</button>
        `)}
      </div>
      <div class="config-actions">
        <button @click=${onClose}>Close</button>
      </div>
    </div>
  </div>
`;
