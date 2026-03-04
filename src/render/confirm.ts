import { html } from 'lit-html';

export const renderConfirmModal = (
  message: string,
  onConfirm: () => void,
  onCancel: () => void,
) => html`
  <div class="hp-modal">
    <div class="config-content">
      <h3>${message}</h3>
      <div class="config-actions">
        <button class="primary" @click=${onConfirm}>Confirm</button>
        <button @click=${onCancel}>Cancel</button>
      </div>
    </div>
  </div>
`;
