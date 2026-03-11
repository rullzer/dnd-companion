import type { State } from './game/state'
import type { HpModal } from './render/health'
import type { DiceResult } from './game/dice'
import { addToHistory } from './game/dice-history'

export type ConfirmModal = {
  message: string
  onConfirm: () => void
}

export type AppState = {
  isConfigOpen: boolean
  configSnapshot: State | null
  hpModal: HpModal | null
  confirmModal: ConfirmModal | null
  isDiceModalOpen: boolean
  diceHistory: DiceResult[]
}

export function createInitialAppState(): AppState {
  return {
    isConfigOpen: false,
    configSnapshot: null,
    hpModal: null,
    confirmModal: null,
    isDiceModalOpen: false,
    diceHistory: [],
  }
}

export function setHpAmount(app: AppState, amount: number): AppState {
  if (!app.hpModal) return app
  return { ...app, hpModal: { ...app.hpModal, amount } }
}

export function addRollToHistory(app: AppState, result: DiceResult): AppState {
  return { ...app, diceHistory: addToHistory(app.diceHistory, result) }
}
