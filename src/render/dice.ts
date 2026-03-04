import { html } from 'lit-html';
import { DICE, type Die, type DiceResult } from '../game/dice';

export const renderDice = (
  modifier: number,
  result: DiceResult | null,
  onRoll: (die: Die) => void,
  onSetModifier: (modifier: number) => void,
) => html`
  <div class="dice-section">
    <h2>Dice</h2>
    <div class="dice-buttons">
      ${DICE.map(die => html`
        <button class="die-btn" @click=${() => onRoll(die)}>d${die}</button>
      `)}
    </div>
    <div class="dice-modifier">
      <label>Modifier</label>
      <div class="stepper">
        <button @click=${() => onSetModifier(modifier - 1)}>-</button>
        <span>${modifier >= 0 ? '+' : ''}${modifier}</span>
        <button @click=${() => onSetModifier(modifier + 1)}>+</button>
      </div>
    </div>
    ${result ? html`
      <div class="dice-result">
        <span class="dice-result-total">${result.total}</span>
        <span class="dice-result-breakdown">
          d${result.die} rolled ${result.roll}${result.modifier !== 0
            ? ` ${result.modifier > 0 ? '+' : ''}${result.modifier}`
            : ''}
        </span>
      </div>
    ` : ''}
  </div>
`;
