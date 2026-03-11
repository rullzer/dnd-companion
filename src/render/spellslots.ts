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
        <div class="spell-list-header">
          <span class="spell-col-level">Lvl</span>
          <span class="spell-col-left">Left</span>
          <span class="spell-col-actions">Cast / Regain</span>
        </div>
        ${levels.map((level, index) => {
          const lvl = index + 1;
          const isDepleted = level.used >= level.total;
          const isFull = level.used <= 0;
          const remaining = level.total - level.used;

          return html`
            <div class="spell-list-row">
              <span class="spell-col-level">${lvl}</span>
              <span class="spell-col-left ${isDepleted ? 'depleted' : ''}">${remaining}</span>
              <div class="spell-col-actions">
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
