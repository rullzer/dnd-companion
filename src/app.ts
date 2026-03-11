import { Game } from './game'
import { GameStorage } from './game-storage'
import { createInitialAppState, addRollToHistory, setHpAmount, type AppState } from './app-state'
import { rollDie, type Die } from './game/dice'
import type { HpModal } from './render/health'
import type { CurrencyType } from './game/currency'

export class App {
  public readonly game: Game
  public readonly storage: GameStorage
  public readonly state: AppState

  public constructor(game: Game, storage: GameStorage, state: AppState) {
    this.game = game
    this.storage = storage
    this.state = state
  }

  public static create(storage: GameStorage): App {
    return new App(new Game(storage.load()), storage, createInitialAppState())
  }

  private update(state: Partial<AppState>): App {
    return new App(this.game, this.storage, { ...this.state, ...state })
  }

  public needsSetup(): boolean {
    return this.game.state.name === ''
  }

  public completeName(name: string): App {
    this.game.setName(name)
    this.storage.save(this.game.state)
    return this.update({})
  }

  public openConfig(): App {
    return this.update({ isConfigOpen: true, configSnapshot: this.game.snapshot() })
  }

  public saveConfig(): App {
    this.storage.save(this.game.state)
    return this.update({ isConfigOpen: false, configSnapshot: null })
  }

  public cancelConfig(): App {
    if (this.state.configSnapshot) this.game.restore(this.state.configSnapshot)
    return this.update({ isConfigOpen: false, configSnapshot: null })
  }

  public openHpModal(type: HpModal['type']): App {
    const amount = type === 'temp' ? this.game.state.health.temporary : 1
    return this.update({ hpModal: { type, amount } })
  }

  public confirmHpModal(): App {
    if (!this.state.hpModal) return this
    const { type, amount } = this.state.hpModal
    if (type === 'damage') this.game.damage(amount)
    else if (type === 'heal') this.game.heal(amount)
    else this.game.setTemporaryHealth(amount)
    this.storage.save(this.game.state)
    return this.update({ hpModal: null })
  }

  public closeHpModal(): App {
    return this.update({ hpModal: null })
  }

  public setHpAmount(amount: number): App {
    return new App(this.game, this.storage, setHpAmount(this.state, amount))
  }

  public openConfirmModal(message: string, onConfirm: () => void): App {
    return this.update({ confirmModal: { message, onConfirm } })
  }

  public closeConfirmModal(): App {
    return this.update({ confirmModal: null })
  }

  public openDiceModal(): App {
    return this.update({ isDiceModalOpen: true })
  }

  public closeDiceModal(): App {
    return this.update({ isDiceModalOpen: false })
  }

  public roll(die: Die): App {
    const result = rollDie(die)
    return new App(
      this.game,
      this.storage,
      addRollToHistory({ ...this.state, isDiceModalOpen: false }, result),
    )
  }

  public longRest(): App {
    this.game.longRest()
    this.storage.save(this.game.state)
    return this.update({})
  }

  public cast(level: number): App {
    this.game.cast(level)
    this.storage.save(this.game.state)
    return this.update({})
  }

  public regainSpellSlot(level: number): App {
    this.game.regainSpellSlot(level)
    this.storage.save(this.game.state)
    return this.update({})
  }

  public adjustCurrency(type: CurrencyType, delta: number): App {
    this.game.adjustCurrency(type, delta)
    this.storage.save(this.game.state)
    return this.update({})
  }

  public setName(name: string): App {
    this.game.setName(name)
    return this.update({})
  }

  public setMaximumHealth(value: number): App {
    this.game.setMaximumHealth(value)
    return this.update({})
  }

  public setSpellLevels(count: number): App {
    this.game.setSpellLevels(count)
    return this.update({})
  }

  public setTotalSpellSlots(level: number, total: number): App {
    this.game.setTotalSpellSlots(level, total)
    return this.update({})
  }
}
