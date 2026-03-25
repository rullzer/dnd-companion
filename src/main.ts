import './style.css';
import { html, render } from 'lit-html';
import { App } from './app';
import { GameStorage } from './game-storage';
import { renderHeader } from './render/header';
import { renderHealth, renderHpModal } from './render/health';
import { renderSpellSlots } from './render/spellslots';
import { renderConfig } from './render/config';
import { renderConfirmModal } from './render/confirm';
import { renderDiceModal } from './render/dice';
import { renderCurrency } from './render/currency';
import { renderNotes } from './render/notes';
import { renderWizard } from './render/setup';
import { createWizard, type Wizard } from './wizard';

const el = document.querySelector<HTMLDivElement>('#app')!;
let app = App.create(new GameStorage());
let wizard: Wizard = createWizard();

let wakeLock: WakeLockSentinel | null = null;
let wakeLockStatus = 'unsupported';

async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) { wakeLockStatus = 'unsupported'; draw(); return; }
  try {
    const permission = await navigator.permissions.query({ name: 'screen-wake-lock' as PermissionName });
    if (permission.state === 'denied') { wakeLockStatus = `permission: ${permission.state}`; draw(); return; }
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLockStatus = 'active';
    wakeLock.addEventListener('release', () => { wakeLock = null; wakeLockStatus = 'released'; draw(); });
    draw();
  } catch (e) {
    wakeLockStatus = `denied: ${e instanceof Error ? e.message : String(e)}`;
    draw();
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') acquireWakeLock();
});

document.addEventListener('pointerdown', () => {
  if (wakeLock === null) acquireWakeLock();
}, { once: true });

acquireWakeLock();

function draw() {
  if (app.needsSetup()) {
    render(
      renderWizard(
        wizard,
        (w) => { wizard = w; draw(); },
        () => { app = app.completeSetup(wizard.name.trim(), wizard.maxHp, wizard.spellSlotTotals); wizard = createWizard(); draw(); },
      ),
      el,
    );
    return;
  }

  const { health, spellSlots, currency, name } = app.gameState;
  const { isConfigOpen, hpModal, confirmModal, isDiceModalOpen, diceHistory } = app.state;

  render(
    html`
      <div class="container">
        ${renderHeader(name, () => { app = app.openConfig(); draw(); }, () => { app = app.openDiceModal(); draw(); }, wakeLockStatus, acquireWakeLock)}
        ${renderHealth(health, (type) => { app = app.openHpModal(type); draw(); }, () => {
          app = app.openConfirmModal('Take a long rest?', () => {
            app = app.longRest().closeConfirmModal();
            draw();
          });
          draw();
        })}
        ${renderSpellSlots(
          spellSlots.levels,
          (lvl) => { app = app.cast(lvl); draw(); },
          (lvl) => { app = app.regainSpellSlot(lvl); draw(); },
        )}
        ${renderCurrency(
          currency,
          (type, delta) => { app = app.adjustCurrency(type, delta); draw(); },
          (type, value) => { app = app.setCurrency(type, value); draw(); },
        )}
        ${renderNotes(app.gameState.notes, (notes) => { app = app.setNotes(notes); draw(); })}
        ${isConfigOpen ? renderConfig(
          name,
          health,
          spellSlots,
          () => { app = app.saveConfig(); draw(); },
          () => { app = app.cancelConfig(); draw(); },
          (v) => { app = app.setName(v); draw(); },
          (v) => { app = app.setMaximumHealth(v); draw(); },
          (v) => { app = app.setSpellLevels(v); draw(); },
          (lvl, total) => { app = app.setTotalSpellSlots(lvl, total); draw(); },
        ) : ''}
        ${confirmModal ? renderConfirmModal(
          confirmModal.message,
          confirmModal.onConfirm,
          () => { app = app.closeConfirmModal(); draw(); },
        ) : ''}
        ${hpModal ? renderHpModal(
          hpModal,
          () => { app = app.confirmHpModal(); draw(); },
          () => { app = app.closeHpModal(); draw(); },
          (amount) => { app = app.setHpAmount(amount); draw(); },
        ) : ''}
        ${isDiceModalOpen ? renderDiceModal(
          diceHistory,
          (die) => { app = app.roll(die); draw(); },
          () => { app = app.closeDiceModal(); draw(); },
        ) : ''}
      </div>
    `,
    el
  );
}

draw();
