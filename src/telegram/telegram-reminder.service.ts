import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { getBotToken } from 'nestjs-telegraf';
import type { Telegraf } from 'telegraf';
import { UserStepService } from '../storage/user-step.service';
import type { Step } from '../storage/entities/user-step.entity';

@Injectable()
export class TelegramReminderService {
  constructor(
    @Inject(getBotToken()) private readonly bot: Telegraf,
    private readonly config: ConfigService,
    private readonly userStep: UserStepService,
  ) {}

  private getMessageForStep(step: Step): string {
    const affiliateLink = this.config.get<string>('AFFILIATE_LINK')?.trim() ?? '';
    switch (step) {
      case 'start':
        return (
          "You have not chosen an option yet. Tap 'Already A Bybit User' to submit your UID, or 'Sign Up & Get Bonus' to get the referral link."
        );
      case 'awaiting_uid':
        return "You have not submitted your Bybit UID yet. Send your UID here to check if you qualify for the VIP group (account must have net assets of at least $100).";
      case 'after_signup':
        return "You got the sign-up link. After signing up, send your Bybit UID here to get access to the VIP group (account must have at least $100).";
      case 'not_registered':
        return (
          "Your UID was not under our affiliate. Please sign up with our referral link first, then send your UID here again." +
          (affiliateLink ? `\n\n${affiliateLink}` : '')
        );
      case 'insufficient_funds':
        return "Your account needs at least $100 to qualify. Top up and send your UID again when ready.";
      default:
        return "Continue your sign-up: send your Bybit UID here to check if you qualify for the VIP group (account must have at least $100).";
    }
  }

  private readonly REMINDER_HEADER = '🔔 Reminder\n\n';

  /** Every 15 minutes, send step-based reminders to users stuck 24h+ at a step. */
  @Cron('*/15 * * * *')
  async sendDueReminders(): Promise<void> {
    const due = await this.userStep.findDueForReminder();
    for (const row of due) {
      try {
        const message = this.REMINDER_HEADER + this.getMessageForStep(row.step as Step);
        await this.bot.telegram.sendMessage(row.telegramId, message);
        await this.userStep.markReminderSent(row.id);
      } catch (err) {
        console.error('[Reminder] Failed to send to', row.telegramId, err);
        await this.userStep.markReminderSent(row.id).catch(() => {});
      }
    }
  }
}
