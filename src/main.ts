import './style.css';
import { html, render } from 'lit-html';
import { Game } from './game';
import type { State } from './game/state';

const app = document.querySelector<HTMLDivElement>('#app')!;
const game = Game.createInitial();

let isConfigOpen = false;
let configSnapshot: State | null = null;
let hpModal: { type: 'damage' | 'heal' | 'temp'; amount: number } | null = null;

function updateAndRender(action: () => void) {
  action();
  game.save();
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

function setHpAmount(amount: number) {
  if (hpModal) { hpModal = { ...hpModal, amount }; draw(); }
}

const renderHeader = () => html`
  <div class="header">
    <h1>DND Companion</h1>
    <button class="config-icon-btn" @click=${openConfig} aria-label="Configure">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.74-.07-1.08l2.32-1.82c.21-.16.27-.46.13-.7l-2.2-3.81c-.14-.24-.42-.32-.66-.24l-2.74 1.1c-.57-.44-1.18-.8-1.86-1.07L14.05 2.3C14 2.04 13.77 1.84 13.5 1.84h-4.4c-.27 0-.5.2-.54.46L8.2 4.49c-.68.27-1.3.63-1.86 1.07L3.6 4.46c-.24-.09-.52 0-.66.24L.74 8.51c-.14.24-.08.54.13.7l2.32 1.82C3.15 11.37 3.12 11.72 3.12 12s.03.63.07.92L.87 14.74c-.21.16-.27.46-.13.7l2.2 3.81c.14.24.42.32.66.24l2.74-1.1c.57.44 1.18.8 1.86 1.07l.36 2.19c.04.26.27.46.54.46h4.4c.27 0 .5-.2.54-.46l.36-2.19c.68-.27 1.3-.63 1.86-1.07l2.74 1.1c.24.09.52 0 .66-.24l2.2-3.81c.14-.24.08-.54-.13-.7l-2.32-1.82z"/>
      </svg>
    </button>
  </div>
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
            @click=${() => setHpAmount(amount - 1)}>-</button>
          <span>${amount}</span>
          <button
            @click=${() => setHpAmount(amount + 1)}>+</button>
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
  if (!isConfigOpen) return '';

  const { health, spellSlots } = game.state;

  return html`
    <div class="config-section">
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

        ${spellSlots.levels.length > 0 ? html`
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
        ` : ''}

        <div class="config-actions">
          <button class="primary" @click=${saveConfig}>Save</button>
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

function init() {
  draw();
}

init();