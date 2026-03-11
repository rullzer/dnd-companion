import './style.css';
import { html, render } from 'lit-html';
import { App } from './app';
import { GameStorage } from './game-storage';
import { renderHeader } from './render/header';
import { renderHealth, renderHpModal } from './render/health';
import { renderSpellSlots } from './render/spellslots';
import { renderConfig } from './render/config';
import { renderConfirmModal } from './render/confirm';
import { renderDice, renderDiceModal } from './render/dice';
import { renderCurrency } from './render/currency';
import { renderSetup } from './render/setup';

const el = document.querySelector<HTMLDivElement>('#app')!;
let app = App.create(new GameStorage());
let setupName = '';

function draw() {
  if (app.needsSetup()) {
    render(
      renderSetup(
        setupName,
        (name) => { setupName = name; draw(); },
        () => { app = app.completeName(setupName.trim()); setupName = ''; draw(); },
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
        ${renderHeader(name, () => { app = app.openConfig(); draw(); })}
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
        ${renderDice(diceHistory, () => { app = app.openDiceModal(); draw(); })}
        ${renderCurrency(currency, (type, delta) => { app = app.adjustCurrency(type, delta); draw(); })}
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
          (die) => { app = app.roll(die); draw(); },
          () => { app = app.closeDiceModal(); draw(); },
        ) : ''}
      </div>
    `,
    el
  );
}

draw();
