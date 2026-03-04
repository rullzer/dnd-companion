import './style.css';
import { html, render } from 'lit-html';
import { Game } from './game';
import type { State } from './game/state';
import { renderHeader } from './render/header';
import { renderHealth, renderHpModal, type HpModal } from './render/health';
import { renderSpellSlots } from './render/spellslots';
import { renderConfig } from './render/config';

const app = document.querySelector<HTMLDivElement>('#app')!;
const game = Game.createInitial();

let isConfigOpen = false;
let configSnapshot: State | null = null;
let hpModal: HpModal | null = null;

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

function openHpModal(type: HpModal['type']) {
  const amount = type === 'temp' ? game.state.health.temporary : 1;
  hpModal = { type, amount };
  draw();
}

function confirmHpModal() {
  if (!hpModal) return;
  const { type, amount } = hpModal;
  if (type === 'damage') game.damage(amount);
  else if (type === 'heal') game.heal(amount);
  else game.setTemporaryHealth(amount);
  game.save();
  hpModal = null;
  draw();
}

function setHpAmount(amount: number) {
  if (hpModal) { hpModal = { ...hpModal, amount }; draw(); }
}

function draw() {
  const { health, spellSlots } = game.state;

  render(
    html`
      <div class="container">
        ${renderHeader(openConfig)}
        ${renderHealth(health, openHpModal)}
        ${renderSpellSlots(
          spellSlots.levels,
          (lvl) => updateAndRender(() => game.cast(lvl)),
          (lvl) => updateAndRender(() => game.regainSpellSlot(lvl)),
        )}
        ${isConfigOpen ? renderConfig(
          health,
          spellSlots,
          saveConfig,
          cancelConfig,
          (v) => updateConfigAndRender(() => game.setMaximumHealth(v)),
          (v) => updateConfigAndRender(() => game.setSpellLevels(v)),
          (lvl, total) => updateConfigAndRender(() => game.setTotalSpellSlots(lvl, total)),
        ) : ''}
        ${hpModal ? renderHpModal(
          hpModal,
          confirmHpModal,
          () => { hpModal = null; draw(); },
          setHpAmount,
        ) : ''}
      </div>
    `,
    app
  );
}

function init() {
  draw();
}

init();
