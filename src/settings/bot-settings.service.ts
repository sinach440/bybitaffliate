import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Tunable bot settings, read from .env. Restart the bot after changing them.
 *
 *   MIN_DEPOSIT_USDT=10            minimum deposit (30d or 365d total) to qualify
 *   MIN_TRADE_VOLUME_USDT=0        minimum trading volume (30d or 365d); 0 = not required
 *   GIVEAWAY_PRIZES=cash,iPhone    comma-separated prizes shown in the welcome message; empty = hidden
 */
@Injectable()
export class BotSettingsService {
  constructor(private readonly config: ConfigService) {}

  private num(key: string, fallback: number): number {
    const raw = this.config.get<string>(key)?.trim();
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  get minDepositUsdt(): number {
    return this.num('MIN_DEPOSIT_USDT', 10);
  }

  get minTradeVolumeUsdt(): number {
    return this.num('MIN_TRADE_VOLUME_USDT', 0);
  }

  get giveawayPrizes(): string[] {
    return (this.config.get<string>('GIVEAWAY_PRIZES') ?? '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
  }

  /** e.g. "cash, iPhone and more" */
  get giveawayPrizesText(): string {
    const prizes = this.giveawayPrizes;
    return prizes.length ? `${prizes.join(', ')} and more` : '';
  }

  /** e.g. "a deposit of at least $10" or "a deposit of at least $10 and trading volume of at least $500" */
  get requirementsText(): string {
    const parts = [`a deposit of at least $${this.minDepositUsdt}`];
    if (this.minTradeVolumeUsdt > 0) {
      parts.push(`trading volume of at least $${this.minTradeVolumeUsdt}`);
    }
    return parts.join(' and ');
  }
}
