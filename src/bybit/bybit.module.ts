import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BybitService } from './bybit.service';

@Module({
  imports: [ConfigModule],
  providers: [BybitService],
  exports: [BybitService],
})
export class BybitModule {}
