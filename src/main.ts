import './style.css';
import { html, render } from 'lit-html';
import { Game } from './game';
import { GameStorage } from './game-storage';
import type { State } from './game/state';
import { renderHeader } from './render/header';
import { renderHealth, renderHpModal, type HpModal } from './render/health';
import { renderSpellSlots } from './render/spellslots';
import { renderConfig } from './render/config';
import { renderConfirmModal } from './render/confirm';
import { renderDice, renderDiceModal } from './render/dice';
import { rollDie, type Die, type DiceResult } from './game/dice';
import { addToHistory } from './game/dice-history';
import { renderCurrency } from './render/currency';
import type { CurrencyType } from './game/currency';

const app = document.querySelector<HTMLDivElement>('#app')!;
const storage = new GameStorage();
const game = new Game(storage.load());

let isConfigOpen = false;
let configSnapshot: State | null = null;
let hpModal: HpModal | null = null;
let confirmModal: { message: string; onConfirm: () => void } | null = null;
let isDiceModalOpen = false;
let diceHistory: DiceResult[] = [];

function updateAndRender(action: () => void) {
  action();
  storage.save(game.state);
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
  storage.save(game.state);
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
  storage.save(game.state);
  hpModal = null;
  draw();
}

function handleRollDie(die: Die) {
  const result = rollDie(die);
  diceHistory = addToHistory(diceHistory, result);
  isDiceModalOpen = false;
  draw();
}

function openConfirmModal(message: string, onConfirm: () => void) {
  confirmModal = { message, onConfirm };
  draw();
}

function adjustCurrency(type: CurrencyType, delta: number) {
  updateAndRender(() => game.adjustCurrency(type, delta));
}

function setHpAmount(amount: number) {
  if (hpModal) { hpModal = { ...hpModal, amount }; draw(); }
}

function draw() {
  const { health, spellSlots } = game.state;

  render(
    html`
      <div class="container">
        ${renderHeader(game.state.name, openConfig)}
        ${renderHealth(health, openHpModal, () => openConfirmModal(
          'Take a long rest?',
          () => updateAndRender(() => { game.longRest(); confirmModal = null; }),
        ))}
        ${renderSpellSlots(
          spellSlots.levels,
          (lvl) => updateAndRender(() => game.cast(lvl)),
          (lvl) => updateAndRender(() => game.regainSpellSlot(lvl)),
        )}
        ${renderDice(diceHistory, () => { isDiceModalOpen = true; draw(); })}
        ${renderCurrency(game.state.currency, adjustCurrency)}
        ${isConfigOpen ? renderConfig(
          game.state.name,
          health,
          spellSlots,
          saveConfig,
          cancelConfig,
          (v) => updateConfigAndRender(() => game.setName(v)),
          (v) => updateConfigAndRender(() => game.setMaximumHealth(v)),
          (v) => updateConfigAndRender(() => game.setSpellLevels(v)),
          (lvl, total) => updateConfigAndRender(() => game.setTotalSpellSlots(lvl, total)),
        ) : ''}
        ${confirmModal ? renderConfirmModal(
          confirmModal.message,
          confirmModal.onConfirm,
          () => { confirmModal = null; draw(); },
        ) : ''}
        ${hpModal ? renderHpModal(
          hpModal,
          confirmHpModal,
          () => { hpModal = null; draw(); },
          setHpAmount,
        ) : ''}
        ${isDiceModalOpen ? renderDiceModal(
          handleRollDie,
          () => { isDiceModalOpen = false; draw(); },
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
