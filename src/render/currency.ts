import { html } from 'lit-html';
import { CURRENCIES, CURRENCY_NAMES, type Currency, type CurrencyType } from '../game/currency';

const CURRENCY_COLORS: Record<CurrencyType, string> = {
  cp: '#b87333',
  sp: '#a8a9ad',
  ep: '#4a9eff',
  gp: '#ffd700',
  pp: '#e0d5f5',
};

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
            <div class="currency-label">
              <span class="currency-coin" style="background:${CURRENCY_COLORS[type]}"></span>
              ${CURRENCY_NAMES[type]}
            </div>
            <div class="currency-controls">
              <button ?disabled=${currency[type] <= 0} @click=${() => onAdjust(type, -1)}>-</button>
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
