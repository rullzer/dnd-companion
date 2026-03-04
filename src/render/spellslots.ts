import { html } from 'lit-html';
import type { SpellLevel } from '../game/spellslots';

export const renderSpellSlots = (
  levels: ReadonlyArray<SpellLevel>,
  onCast: (lvl: number) => void,
  onRegain: (lvl: number) => void,
) => {
  if (levels.length === 0) return '';

  return html`
    <div class="spell-section">
      <h2>Spell Slots</h2>
      <table class="spell-table">
        <thead>
          <tr>
            <th>Lvl</th>
            <th>Total</th>
            <th>Left</th>
            <th>Cast / Regain</th>
          </tr>
        </thead>
        <tbody>
          ${levels.map((level, index) => {
            const lvl = index + 1;
            const isDepleted = level.used >= level.total;
            const isFull = level.used <= 0;
            const remaining = level.total - level.used;

            return html`
              <tr>
                <td>${lvl}</td>
                <td>${level.total}</td>
                <td>
                  <span class="slot-remaining ${isDepleted ? 'depleted' : ''}">
                    ${remaining}
                  </span>
                </td>
                <td>
                  <button class="slot-btn"
                    ?disabled=${isFull}
                    @click=${() => onRegain(lvl)}>
                    Regain
                  </button>
                  <button class="slot-btn"
                    ?disabled=${isDepleted}
                    @click=${() => onCast(lvl)}>
                    Cast
                  </button>
                </td>
              </tr>
            `;
          })}
        </tbody>
      </table>
    </div>
  `;
};
