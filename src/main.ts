import './style.css';
import { html, render } from 'lit-html';
import { Game } from './game';

const app = document.querySelector<HTMLDivElement>('#app')!;
const game = Game.createInitial();

let isConfigOpen = false;
let configSnapshot: ReturnType<typeof game.snapshot> | null = null;
let hpModal: { type: 'damage' | 'heal' | 'temp'; amount: number } | null = null;

function updateAndRender(action: () => void) {
  action();
  game.save(); // Auto-save on every change, matching your current logic
  draw();
}

function updateConfigAndRender(action: () => void) {
  action();
  draw();
}

function openConfig() {
  configSnapshot = game.snapshot();
  isConfigOpen = true;
  draw();
}

function saveConfig() {
  game.save();
  configSnapshot = null;
  isConfigOpen = false;
  draw();
}

function cancelConfig() {
  if (configSnapshot) game.restore(configSnapshot);
  configSnapshot = null;
  isConfigOpen = false;
  draw();
}

function openHpModal(type: 'damage' | 'heal' | 'temp') {
  const amount = type === 'temp' ? game.state.health.temporary : 1;
  hpModal = { type, amount };
  draw();
}

const renderHeader = () => html`
  <h1>DND Companion</h1>
  <button class="top-config-btn" @click=${openConfig}>Configure</button>
`;

const renderHpModal = () => {
  if (!hpModal) return '';

  const { type, amount } = hpModal;
  const title = type === 'damage' ? 'Take Damage' : type === 'heal' ? 'Heal' : 'Set Temp HP';
  const minAmount = type === 'temp' ? 0 : 1;

  const confirm = () => {
    if (type === 'damage') {
      game.damage(amount);
    } else if (type === 'heal') {
      game.heal(amount);
    } else {
      game.setTemporaryHealth(amount);
    }
    game.save();
    hpModal = null;
    draw();
  };

  return html`
    <div class="hp-modal">
      <div class="config-content">
        <h3>${title}</h3>
        <div class="stepper">
          <button
            ?disabled=${amount <= minAmount}
            @click=${() => { hpModal = { type, amount: amount - 1 }; draw(); }}>-</button>
          <span>${amount}</span>
          <button
            @click=${() => { hpModal = { type, amount: amount + 1 }; draw(); }}>+</button>
        </div>
        <div class="config-actions">
          <button class="primary" @click=${confirm}>Confirm</button>
          <button @click=${() => { hpModal = null; draw(); }}>Cancel</button>
        </div>
      </div>
    </div>
  `;
};

const renderHealth = () => {
  const { current, maximum, temporary } = game.state.health;

  const tempText = temporary > 0
    ? html`<span class="hp-temp">(+${temporary} temp)</span>`
    : '';

  return html`
    <div class="hp-section">
      <h2>HP</h2>
      <div class="hp-controls">
        <button class="btn-danger" @click=${() => openHpModal('damage')}>Hit</button>
        <span id="hp-display">${current} / ${maximum} ${tempText}</span>
        <button class="btn-heal" @click=${() => openHpModal('heal')}>Heal</button>
      </div>
      <div class="hp-temp-row">
        <button class="btn-temp" @click=${() => openHpModal('temp')}>Temp HP</button>
      </div>
    </div>
  `;
};

const renderSpellSlots = () => {
  const levels = game.state.spellSlots.levels;

  if (levels.length === 0) return '';

  return html`
    <div class="spell-section">
      <h2>Spell Slots</h2>
      <table class="spell-table">
        <thead>
          <tr>
            <th>Lvl</th>
            <th>Total</th>
            <th>Left</th>
            <th>Cast / Regain</th>
          </tr>
        </thead>
        <tbody>
          ${levels.map((level, index) => {
            const lvl = index + 1;
            const isDepleted = level.used >= level.total;
            const isFull = level.used <= 0;
            const remaining = level.total - level.used;

            return html`
              <tr>
                <td>${lvl}</td>
                <td>${level.total}</td>
                <td>
                  <span class="slot-remaining ${isDepleted ? 'depleted' : ''}">
                    ${remaining}
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
          <div class="stepper">
            <button
              ?disabled=${health.maximum <= 1}
              @click=${() => updateConfigAndRender(() => game.setMaximumHealth(health.maximum - 1))}>-</button>
            <span>${health.maximum}</span>
            <button
              @click=${() => updateConfigAndRender(() => game.setMaximumHealth(health.maximum + 1))}>+</button>
          </div>
        </div>

        <div class="config-row">
          <label>Spell Levels:</label>
          <div class="stepper">
            <button
              ?disabled=${spellSlots.levels.length <= 0}
              @click=${() => updateConfigAndRender(() => game.setSpellLevels(spellSlots.levels.length - 1))}>-</button>
            <span>${spellSlots.levels.length}</span>
            <button
              ?disabled=${spellSlots.levels.length >= 9}
              @click=${() => updateConfigAndRender(() => game.setSpellLevels(spellSlots.levels.length + 1))}>+</button>
          </div>
        </div>

        <h4>Spell Slot Totals</h4>
        <div class="config-slots-grid">
          ${spellSlots.levels.map((level, i) => html`
            <div class="config-slot-item">
              <label>Lvl ${i + 1}</label>
              <div class="stepper">
                <button
                  ?disabled=${level.total <= 0}
                  @click=${() => updateConfigAndRender(() => game.setTotalSpellSlots(i + 1, level.total - 1))}>-</button>
                <span>${level.total}</span>
                <button
                  @click=${() => updateConfigAndRender(() => game.setTotalSpellSlots(i + 1, level.total + 1))}>+</button>
              </div>
            </div>
          `)}
        </div>

        <div class="config-actions">
          <button class="primary" @click=${saveConfig}>Save & Close</button>
          <button @click=${cancelConfig}>Cancel</button>
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
        ${renderHpModal()}
      </div>
    `,
    app
  );
}

draw();