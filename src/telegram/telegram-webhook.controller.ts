import { Controller, Post, Req, Res, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getBotToken } from 'nestjs-telegraf';
import type { Telegraf } from 'telegraf';
import type { Request, Response } from 'express';

/**
 * Handles POST requests from Telegram to the webhook path.
 * Nest's router runs before raw app.use() middleware, so we must handle the webhook
 * in a controller to avoid 404.
 */
@Controller()
export class TelegramWebhookController {
  constructor(
    @Inject(getBotToken()) private readonly bot: Telegraf,
    private readonly config: ConfigService,
  ) {}

  @Post('telegram-webhook')
  handleWebhook(@Req() req: Request, @Res() res: Response): void {
    const webhookPath = this.config.get<string>('WEBHOOK_PATH', '/telegram-webhook');
    // Telegraf's webhookFilter compares req.url to this path; ensure it matches
    req.url = webhookPath;
    const callback = this.bot.webhookCallback(webhookPath);
    callback(req, res, () => {
      if (!res.writableEnded) {
        res.status(200).end();
      }
    });
  }
}
