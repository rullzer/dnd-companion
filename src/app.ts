import type { State } from './game/state'
import { GameStorage } from './game-storage'
import { createInitialAppState, addRollToHistory, setHpAmount, type AppState } from './app-state'
import { rollDie, type Die } from './game/dice'
import type { HpModal } from './render/health'
import type { CurrencyType } from './game/currency'
import { SpellSlots } from './game/spellslots'
import * as actions from './game/actions'

export class App {
  public readonly gameState: State
  public readonly storage: GameStorage
  public readonly state: AppState

  public constructor(gameState: State, storage: GameStorage, state: AppState) {
    this.gameState = gameState
    this.storage = storage
    this.state = state
  }

  public static create(storage: GameStorage): App {
    return new App(storage.load(), storage, createInitialAppState())
  }

  private update(gameState: State, appState?: Partial<AppState>): App {
    const nextAppState = appState ? { ...this.state, ...appState } : this.state
    return new App(gameState, this.storage, nextAppState)
  }

  private save(gameState: State, appState?: Partial<AppState>): App {
    this.storage.save(gameState)
    return this.update(gameState, appState)
  }

  public needsSetup(): boolean {
    return this.gameState.name === ''
  }

  public completeSetup(name: string, maxHp: number, spellSlotTotals: number[]): App {
    let gameState = actions.setName(this.gameState, name)
    gameState = actions.setMaximumHealth(gameState, maxHp)
    gameState = { ...gameState, health: gameState.health.restore() }
    gameState = { ...gameState, spellSlots: new SpellSlots(spellSlotTotals.map(total => ({ total, used: 0 }))) }
    return this.save(gameState)
  }

  public openConfig(): App {
    return this.update(this.gameState, { isConfigOpen: true, configSnapshot: this.gameState })
  }

  public saveConfig(): App {
    return this.save(this.gameState, { isConfigOpen: false, configSnapshot: null })
  }

  public cancelConfig(): App {
    const gameState = this.state.configSnapshot ?? this.gameState
    return this.update(gameState, { isConfigOpen: false, configSnapshot: null })
  }

  public openHpModal(type: HpModal['type']): App {
    const amount = type === 'temp' ? this.gameState.health.temporary : 1
    return this.update(this.gameState, { hpModal: { type, amount } })
  }

  public confirmHpModal(): App {
    if (!this.state.hpModal) return this
    const { type, amount } = this.state.hpModal
    let gameState = this.gameState
    if (type === 'damage') gameState = actions.damage(gameState, amount)
    else if (type === 'heal') gameState = actions.heal(gameState, amount)
    else gameState = actions.setTemporaryHealth(gameState, amount)
    return this.save(gameState, { hpModal: null })
  }

  public closeHpModal(): App {
    return this.update(this.gameState, { hpModal: null })
  }

  public setHpAmount(amount: number): App {
    return this.update(this.gameState, setHpAmount(this.state, amount))
  }

  public openConfirmModal(message: string, onConfirm: () => void): App {
    return this.update(this.gameState, { confirmModal: { message, onConfirm } })
  }

  public closeConfirmModal(): App {
    return this.update(this.gameState, { confirmModal: null })
  }

  public openDiceModal(): App {
    return this.update(this.gameState, { isDiceModalOpen: true })
  }

  public closeDiceModal(): App {
    return this.update(this.gameState, { isDiceModalOpen: false })
  }

  public roll(die: Die): App {
    const result = rollDie(die)
    return this.update(this.gameState, addRollToHistory(this.state, result))
  }

  public longRest(): App {
    return this.save(actions.longRest(this.gameState))
  }

  public cast(level: number): App {
    return this.save(actions.cast(this.gameState, level))
  }

  public regainSpellSlot(level: number): App {
    return this.save(actions.regainSpellSlot(this.gameState, level))
  }

  public adjustCurrency(type: CurrencyType, delta: number): App {
    return this.save(actions.adjustCurrency(this.gameState, type, delta))
  }

  public setCurrency(type: CurrencyType, value: number): App {
    return this.save(actions.setCurrency(this.gameState, type, value))
  }

  public setNotes(notes: string): App {
    return this.save(actions.setNotes(this.gameState, notes))
  }

  public setName(name: string): App {
    return this.update(actions.setName(this.gameState, name))
  }

  public setMaximumHealth(value: number): App {
    return this.update(actions.setMaximumHealth(this.gameState, value))
  }

  public setSpellLevels(count: number): App {
    return this.update(actions.setSpellLevels(this.gameState, count))
  }

  public setTotalSpellSlots(level: number, total: number): App {
    return this.update(actions.setTotalSpellSlots(this.gameState, level, total))
  }
}
