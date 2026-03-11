import { html } from 'lit-html';
import type { Health } from '../game/health';

export type HpModal = { type: 'damage' | 'heal' | 'temp'; amount: number };

export const renderHealth = (
  health: Health,
  onOpenModal: (type: HpModal['type']) => void,
  onLongRest: () => void,
) => {
  const { current, maximum, temporary } = health;

  return html`
    <div class="hp-section">
      <h2>HP</h2>
      <div class="hp-controls">
        <button class="btn-danger" @click=${() => onOpenModal('damage')}>Hit</button>
        <div class="hp-display">
          <span>${current} / ${maximum}</span>
          ${temporary > 0 ? html`<span class="hp-temp">+${temporary} temp</span>` : ''}
        </div>
        <button class="btn-heal" @click=${() => onOpenModal('heal')}>Heal</button>
      </div>
      <div class="hp-temp-row">
        <button class="btn-temp" @click=${() => onOpenModal('temp')}>Temp HP</button>
        <button class="btn-rest" @click=${onLongRest}>Long Rest</button>
      </div>
    </div>
  `;
};

export const renderHpModal = (
  modal: HpModal,
  onConfirm: () => void,
  onCancel: () => void,
  onSetAmount: (n: number) => void,
) => {
  const { type, amount } = modal;
  const title = type === 'damage' ? 'Take Damage' : type === 'heal' ? 'Heal' : 'Set Temp HP';
  const minAmount = type === 'temp' ? 0 : 1;

  return html`
    <div class="hp-modal">
      <div class="config-content">
        <h3>${title}</h3>
        <div class="stepper">
          <button
            ?disabled=${amount <= minAmount}
            @click=${() => onSetAmount(amount - 1)}>-</button>
          <span>${amount}</span>
          <button
            @click=${() => onSetAmount(amount + 1)}>+</button>
        </div>
        <div class="config-actions">
          <button class="primary" @click=${onConfirm}>Confirm</button>
          <button @click=${onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  `;
};
