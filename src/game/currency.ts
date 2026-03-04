export const CURRENCIES = ['cp', 'sp', 'ep', 'gp', 'pp'] as const;

export type CurrencyType = typeof CURRENCIES[number];

export const CURRENCY_LABELS: Record<CurrencyType, string> = {
  cp: 'Copper (CP)',
  sp: 'Silver (SP)',
  ep: 'Electrum (EP)',
  gp: 'Gold (GP)',
  pp: 'Platinum (PP)',
};

type CurrencyAmounts = Record<CurrencyType, number>;

export class Currency {
  public readonly cp: number;
  public readonly sp: number;
  public readonly ep: number;
  public readonly gp: number;
  public readonly pp: number;

  public constructor(amounts: Partial<CurrencyAmounts> = {}) {
    this.cp = Math.max(0, amounts.cp ?? 0);
    this.sp = Math.max(0, amounts.sp ?? 0);
    this.ep = Math.max(0, amounts.ep ?? 0);
    this.gp = Math.max(0, amounts.gp ?? 0);
    this.pp = Math.max(0, amounts.pp ?? 0);
  }

  public adjust(type: CurrencyType, delta: number): Currency {
    return new Currency({ ...this, [type]: this[type] + delta });
  }

  public totalInCp(): number {
    return this.pp * 1000 + this.gp * 100 + this.ep * 50 + this.sp * 10 + this.cp;
  }
}
