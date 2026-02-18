import './style.css';
import { html, render } from 'lit-html';
import { Game } from './game';

const app = document.querySelector<HTMLDivElement>('#app')!;
const game = Game.createInitial();

let isConfigOpen = false;

function updateAndRender(action: () => void) {
  action();
  game.save(); // Auto-save on every change, matching your current logic
  draw();
}

function toggleConfig(open: boolean) {
  isConfigOpen = open;
  draw();
}

const renderHeader = () => html`
  <h1>DND Companion</h1>
  <button class="top-config-btn" @click=${() => toggleConfig(true)}>Configure</button>
`;

const renderHealth = () => {
  const { current, maximum, temporary } = game.state.health;

  const tempText = temporary > 0 
    ? html`<span class="hp-temp">(+${temporary} temp)</span>` 
    : '';

  return html`
    <div class="hp-section">
      <h2>HP</h2>
      <div class="hp-controls">
        <button @click=${() => updateAndRender(() => game.damage(1))}>-</button>
        <span id="hp-display">${current} / ${maximum} ${tempText}</span>
        <button @click=${() => updateAndRender(() => game.heal(1))}>+</button>
      </div>
    </div>
  `;
};

const renderSpellSlots = () => {
  const levels = game.state.spellSlots.levels;

  return html`
    <div class="spell-section">
      <h2>Spell Slots</h2>
      <table class="spell-table">
        <thead>
          <tr>
            <th>Lvl</th>
            <th>Total</th>
            <th>Used</th>
            <th>Cast / Regain</th>
          </tr>
        </thead>
        <tbody>
          ${levels.map((level, index) => {
            const lvl = index + 1;
            const isDepleted = level.used >= level.total;
            const isFull = level.used <= 0;

            return html`
              <tr>
                <td>${lvl}</td>
                <td>${level.total}</td>
                <td>
                  <span class="slot-used ${isDepleted ? 'depleted' : ''}">
                    ${level.used}
                  </span>
                </td>
                <td>
                  <button class="slot-btn" 
                    ?disabled=${isFull} 
                    @click=${() => updateAndRender(() => game.regainSpellSlot(lvl))}>
                    Regain
                  </button>
                  <button class="slot-btn" 
                    ?disabled=${isDepleted} 
                    @click=${() => updateAndRender(() => game.cast(lvl))}>
                    Cast
                  </button>
                </td>
              </tr>
            `;
          })}
        </tbody>
      </table>
    </div>
  `;
};

const renderConfig = () => {
  const style = isConfigOpen ? 'display:flex' : 'display:none';
  const { health, spellSlots } = game.state;

  return html`
    <div class="config-section" style="${style}">
      <div class="config-content">
        <h3>Configure Character</h3>
        
        <div class="config-row">
          <label>Max HP:</label>
          <input type="number" min="1" 
            .value=${health.maximum} 
            @change=${(e: any) => updateAndRender(() => game.setMaximumHealth(Number(e.target.value)))} />
        </div>

        <div class="config-row">
          <label>Spell Levels:</label>
          <input type="number" min="1" max="9" 
            .value=${spellSlots.levels.length} 
            @change=${(e: any) => updateAndRender(() => game.setSpellLevels(Number(e.target.value)))} />
        </div>

        <h4>Spell Slot Totals</h4>
        <div class="config-slots-grid">
          ${spellSlots.levels.map((level, i) => html`
            <div class="config-slot-item">
              <label>Lvl ${i + 1}</label>
              <input type="number" min="0" 
                .value=${level.total} 
                @change=${(e: any) => updateAndRender(() => game.setTotalSpellSlots(i + 1, Number(e.target.value)))} />
            </div>
          `)}
        </div>

        <div class="config-actions">
          <button class="primary" @click=${() => toggleConfig(false)}>Save & Close</button>
          <button @click=${() => toggleConfig(false)}>Cancel</button>
        </div>
      </div>
    </div>
  `;
};

function draw() {
  render(
    html`
      <div class="container">
        ${renderHeader()}
        ${renderHealth()}
        ${renderSpellSlots()}
        ${renderConfig()}
      </div>
    `,
    app
  );
}

draw();