import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { getBotToken } from 'nestjs-telegraf';
import type { Telegraf } from 'telegraf';
import { PendingUidRequestService } from '../storage/pending-uid-request.service';

const REMINDER_MESSAGE =
  "You haven't submitted your Bybit UID yet. Send your UID here to check if you qualify for the Elite group (account must have net assets of at least $100).";

@Injectable()
export class TelegramReminderService {
  constructor(
    @Inject(getBotToken()) private readonly bot: Telegraf,
    private readonly pendingUid: PendingUidRequestService,
  ) {}

  /** Every 15 minutes, send reminders to users who were asked for UID 24h+ ago. */
  @Cron('*/15 * * * *')
  async sendDueReminders(): Promise<void> {
    const due = await this.pendingUid.findDueForReminder();
    for (const row of due) {
      try {
        await this.bot.telegram.sendMessage(row.telegramId, REMINDER_MESSAGE);
        await this.pendingUid.markReminderSent(row.id);
      } catch (err) {
        console.error('[Reminder] Failed to send to', row.telegramId, err);
        // Still mark as sent so we don't spam (e.g. user blocked the bot)
        await this.pendingUid.markReminderSent(row.id).catch(() => {});
      }
    }
  }
}
