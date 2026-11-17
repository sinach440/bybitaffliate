import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Tunable bot settings, read from .env. Restart the bot after changing them.
 *
 *   MIN_DEPOSIT_USDT=10            minimum deposit (30d or 365d total) to qualify
 *   MIN_TRADE_VOLUME_USDT=0        minimum trading volume (30d or 365d); 0 = not required
 *   GIVEAWAY_PRIZES=cash,iPhone    comma-separated prizes shown in the welcome message; empty = hidden
 *   REWARDS=a|b                    reward lines shown in /start, separated by "|"; overrides GIVEAWAY_PRIZES
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

  /** REWARDS from .env, one reward per line, separated by "|". */
  get rewardLines(): string[] {
    return (this.config.get<string>('REWARDS') ?? '')
      .split('|')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  /** "🎁 Rewards:\n• ...\n\n", else the old GIVEAWAY_PRIZES line, or "" when REWARDS is empty. */
  get rewardsBlock(): string {
    const lines = this.rewardLines;
    if (!lines.length) return this.giveawayPrizesText ? `🎁 Giveaways (${this.giveawayPrizesText})\n\n` : '';
    return lines.length ? `🎁 Rewards:\n${lines.map((l) => `• ${l}`).join('\n')}\n\n` : '';
  }

  /** "ANY amount" when the minimum deposit is $1 or less, else e.g. "$10". */
  get depositAmountText(): string {
    return this.minDepositUsdt <= 1 ? 'ANY amount' : `$${this.minDepositUsdt}`;
  }

  /** Shown exactly as written, e.g. "$300 and a surprise gift" or "cash, iPhone" */
  get giveawayPrizesText(): string {
    return this.giveawayPrizes.join(', ');
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
