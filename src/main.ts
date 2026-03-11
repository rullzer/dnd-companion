import './style.css';
import { html, render } from 'lit-html';
import { Game } from './game';
import { GameStorage } from './game-storage';
import { createInitialAppState, setHpAmount, addRollToHistory, type AppState } from './app-state';
import { renderHeader } from './render/header';
import { renderHealth, renderHpModal, type HpModal } from './render/health';
import { renderSpellSlots } from './render/spellslots';
import { renderConfig } from './render/config';
import { renderConfirmModal } from './render/confirm';
import { renderDice, renderDiceModal } from './render/dice';
import { rollDie, type Die } from './game/dice';
import { renderCurrency } from './render/currency';
import type { CurrencyType } from './game/currency';

const storage = new GameStorage();
const game = new Game(storage.load());
const app_el = document.querySelector<HTMLDivElement>('#app')!;

let app: AppState = createInitialAppState();

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
  app = { ...app, isConfigOpen: true, configSnapshot: game.snapshot() };
  draw();
}

function saveConfig() {
  storage.save(game.state);
  app = { ...app, isConfigOpen: false, configSnapshot: null };
  draw();
}

function cancelConfig() {
  if (app.configSnapshot) game.restore(app.configSnapshot);
  app = { ...app, isConfigOpen: false, configSnapshot: null };
  draw();
}

function openHpModal(type: HpModal['type']) {
  const amount = type === 'temp' ? game.state.health.temporary : 1;
  app = { ...app, hpModal: { type, amount } };
  draw();
}

function confirmHpModal() {
  if (!app.hpModal) return;
  const { type, amount } = app.hpModal;
  if (type === 'damage') game.damage(amount);
  else if (type === 'heal') game.heal(amount);
  else game.setTemporaryHealth(amount);
  storage.save(game.state);
  app = { ...app, hpModal: null };
  draw();
}

function handleRollDie(die: Die) {
  app = addRollToHistory({ ...app, isDiceModalOpen: false }, rollDie(die));
  draw();
}

function openConfirmModal(message: string, onConfirm: () => void) {
  app = { ...app, confirmModal: { message, onConfirm } };
  draw();
}

function adjustCurrency(type: CurrencyType, delta: number) {
  updateAndRender(() => game.adjustCurrency(type, delta));
}

function draw() {
  const { health, spellSlots } = game.state;

  render(
    html`
      <div class="container">
        ${renderHeader(game.state.name, openConfig)}
        ${renderHealth(health, openHpModal, () => openConfirmModal(
          'Take a long rest?',
          () => updateAndRender(() => { game.longRest(); app = { ...app, confirmModal: null }; }),
        ))}
        ${renderSpellSlots(
          spellSlots.levels,
          (lvl) => updateAndRender(() => game.cast(lvl)),
          (lvl) => updateAndRender(() => game.regainSpellSlot(lvl)),
        )}
        ${renderDice(app.diceHistory, () => { app = { ...app, isDiceModalOpen: true }; draw(); })}
        ${renderCurrency(game.state.currency, adjustCurrency)}
        ${app.isConfigOpen ? renderConfig(
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
        ${app.confirmModal ? renderConfirmModal(
          app.confirmModal.message,
          app.confirmModal.onConfirm,
          () => { app = { ...app, confirmModal: null }; draw(); },
        ) : ''}
        ${app.hpModal ? renderHpModal(
          app.hpModal,
          confirmHpModal,
          () => { app = { ...app, hpModal: null }; draw(); },
          (amount) => { app = setHpAmount(app, amount); draw(); },
        ) : ''}
        ${app.isDiceModalOpen ? renderDiceModal(
          handleRollDie,
          () => { app = { ...app, isDiceModalOpen: false }; draw(); },
        ) : ''}
      </div>
    `,
    app_el
  );
}

draw();
