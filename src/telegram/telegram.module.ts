import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { StorageModule } from '../storage/storage.module';
import { VerificationModule } from '../verification/verification.module';
import { TelegramReminderService } from './telegram-reminder.service';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';
import { TelegramWebhookController } from './telegram-webhook.controller';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '',
        // Do not auto-launch; main.ts sets up webhook (production) or polling (development)
        launchOptions: false,
        // Explicitly include this module so /start and other handlers are registered
        include: [TelegramModule],
      }),
      inject: [ConfigService],
    }),
    StorageModule,
    VerificationModule,
  ],
  controllers: [TelegramWebhookController],
  providers: [TelegramUpdate, TelegramService, TelegramReminderService],
})
export class TelegramModule {}
