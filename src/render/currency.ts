import { html } from 'lit-html';
import { CURRENCIES, CURRENCY_LABELS, type Currency, type CurrencyType } from '../game/currency';

export const renderCurrency = (
  currency: Currency,
  onAdjust: (type: CurrencyType, delta: number) => void,
) => {
  const totalCp = currency.totalInCp();
  const totalGp = (totalCp / 100).toFixed(2).replace(/\.?0+$/, '');

  return html`
    <div class="currency-section">
      <h2>Money</h2>
      <div class="currency-rows">
        ${CURRENCIES.map(type => html`
          <div class="currency-row">
            <span class="currency-label">${CURRENCY_LABELS[type]}</span>
            <div class="currency-controls">
              <button
                ?disabled=${currency[type] <= 0}
                @click=${() => onAdjust(type, -1)}>-</button>
              <span class="currency-amount">${currency[type]}</span>
              <button @click=${() => onAdjust(type, 1)}>+</button>
            </div>
          </div>
        `)}
      </div>
      <div class="currency-total">Total: ${totalGp} gp</div>
    </div>
  `;
};
