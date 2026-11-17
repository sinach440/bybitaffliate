import { Global, Module } from '@nestjs/common';
import { BotSettingsService } from './bot-settings.service';

@Global()
@Module({
  providers: [BotSettingsService],
  exports: [BotSettingsService],
})
export class SettingsModule {}
