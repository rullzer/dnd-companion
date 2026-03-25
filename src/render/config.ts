import { html } from 'lit-html';
import type { Health } from '../game/health';
import type { SpellSlots } from '../game/spellslots';

export const renderConfig = (
  name: string,
  health: Health,
  spellSlots: SpellSlots,
  onSave: () => void,
  onCancel: () => void,
  onSetName: (value: string) => void,
  onSetMaxHealth: (value: number) => void,
  onSetSpellLevels: (count: number) => void,
  onSetTotalSpellSlots: (level: number, total: number) => void,
) => html`
  <div class="config-section">
    <div class="config-content">
      <h3>Configure Character</h3>

      <div class="config-row">
        <label>Name:</label>
        <input
          type="text"
          .value=${name}
          @input=${(e: Event) => onSetName((e.target as HTMLInputElement).value)}
          placeholder="Character name"
        />
      </div>

      <div class="config-row">
        <label>Max HP:</label>
        <div class="stepper">
          <button
            ?disabled=${health.maximum <= 1}
            @click=${() => onSetMaxHealth(health.maximum - 1)}>-</button>
          <input
            class="stepper-input"
            type="number"
            .value=${String(health.maximum)}
            min="1"
            @change=${(e: Event) => {
              const v = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(v)) onSetMaxHealth(Math.max(1, v));
            }}
          />
          <button
            @click=${() => onSetMaxHealth(health.maximum + 1)}>+</button>
        </div>
      </div>

      <div class="config-row">
        <label>Spell Levels:</label>
        <div class="stepper">
          <button
            ?disabled=${spellSlots.levels.length <= 0}
            @click=${() => onSetSpellLevels(spellSlots.levels.length - 1)}>-</button>
          <input
            class="stepper-input"
            type="number"
            .value=${String(spellSlots.levels.length)}
            min="0"
            max="9"
            @change=${(e: Event) => {
              const v = parseInt((e.target as HTMLInputElement).value);
              if (!isNaN(v)) onSetSpellLevels(Math.min(9, Math.max(0, v)));
            }}
          />
          <button
            ?disabled=${spellSlots.levels.length >= 9}
            @click=${() => onSetSpellLevels(spellSlots.levels.length + 1)}>+</button>
        </div>
      </div>

      ${spellSlots.levels.length > 0 ? html`
        <h4>Spell Slot Totals</h4>
        <div class="config-slots-grid">
          ${spellSlots.levels.map((level, i) => html`
            <div class="config-slot-item">
              <label>Lvl ${i + 1}</label>
              <div class="stepper">
                <button
                  ?disabled=${level.total <= 0}
                  @click=${() => onSetTotalSpellSlots(i + 1, level.total - 1)}>-</button>
                <input
                  class="stepper-input"
                  type="number"
                  .value=${String(level.total)}
                  min="0"
                  @change=${(e: Event) => {
                    const v = parseInt((e.target as HTMLInputElement).value);
                    if (!isNaN(v)) onSetTotalSpellSlots(i + 1, Math.max(0, v));
                  }}
                />
                <button
                  @click=${() => onSetTotalSpellSlots(i + 1, level.total + 1)}>+</button>
              </div>
            </div>
          `)}
        </div>
      ` : ''}

      <div class="config-actions">
        <button class="primary" @click=${onSave}>Save</button>
        <button @click=${onCancel}>Cancel</button>
      </div>
    </div>
  </div>
`;
