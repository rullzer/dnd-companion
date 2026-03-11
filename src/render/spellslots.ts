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
      <div class="spell-list">
        ${levels.map((level, index) => {
          const lvl = index + 1;
          const isDepleted = level.used >= level.total;
          const isFull = level.used <= 0;
          const remaining = level.total - level.used;
          const dots = Array.from({ length: level.total }, (_, i) => i < remaining);

          return html`
            <div class="spell-list-row">
              <div class="spell-row-info">
                <span class="spell-level-badge">${lvl}</span>
                <div class="spell-dots">
                  ${dots.map(available => html`
                    <span class="spell-dot ${available ? 'available' : 'used'}"></span>
                  `)}
                </div>
              </div>
              <div class="spell-row-actions">
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
              </div>
            </div>
          `;
        })}
      </div>
    </div>
  `;
};
