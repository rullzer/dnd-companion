import { html } from 'lit-html';

export const renderHeader = (name: string, onConfig: () => void, onDice: () => void, wakeLockStatus: string, onRequestWakeLock: () => void) => html`
  <div class="header">
    <button class="dice-icon-btn" @click=${onDice} aria-label="Dice roller">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-9 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-4.5-4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
      </svg>
    </button>
    <h1>${name || 'DND Companion'}</h1>
    ${wakeLockStatus === 'active'
      ? html`<span class="wakelock-icon-btn" title="Screen will stay on" aria-label="Screen wake lock active">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <path d="M12 3V5.25M18.364 5.636l-1.591 1.591M21 12h-2.25M18.364 18.364l-1.591-1.591M12 18.75V21M7.227 16.773l-1.591 1.591M5.25 12H3M7.227 7.227L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z"/>
          </svg>
        </span>`
      : html`<button class="wakelock-icon-btn" title="Tap to keep screen on" aria-label="Keep screen on" @click=${onRequestWakeLock}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <path d="M21.752 15.002A9 9 0 0 1 8.25 6.001c0-1.33.266-2.597.748-3.752A9 9 0 1 0 21.752 15z"/>
          </svg>
        </button>`
    }
    <button class="config-icon-btn" @click=${onConfig} aria-label="Configure">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.69.07-1.08s-.03-.74-.07-1.08l2.32-1.82c.21-.16.27-.46.13-.7l-2.2-3.81c-.14-.24-.42-.32-.66-.24l-2.74 1.1c-.57-.44-1.18-.8-1.86-1.07L14.05 2.3C14 2.04 13.77 1.84 13.5 1.84h-4.4c-.27 0-.5.2-.54.46L8.2 4.49c-.68.27-1.3.63-1.86 1.07L3.6 4.46c-.24-.09-.52 0-.66.24L.74 8.51c-.14.24-.08.54.13.7l2.32 1.82C3.15 11.37 3.12 11.72 3.12 12s.03.63.07.92L.87 14.74c-.21.16-.27.46-.13.7l2.2 3.81c.14.24.42.32.66.24l2.74-1.1c.57.44 1.18.8 1.86 1.07l.36 2.19c.04.26.27.46.54.46h4.4c.27 0 .5-.2.54-.46l.36-2.19c.68-.27 1.3-.63 1.86-1.07l2.74 1.1c.24.09.52 0 .66-.24l2.2-3.81c.14-.24.08-.54-.13-.7l-2.32-1.82z"/>
      </svg>
    </button>
  </div>
`;
