import { Injectable } from '@nestjs/common';

/**
 * Optional service for Telegram-related logic (e.g. rate limiting, analytics).
 * Message handling is done in TelegramUpdate with nestjs-telegraf decorators.
 */
@Injectable()
export class TelegramService {}
