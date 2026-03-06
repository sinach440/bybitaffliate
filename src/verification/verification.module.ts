import { Module } from '@nestjs/common';
import { BybitModule } from '../bybit/bybit.module';
import { StorageModule } from '../storage/storage.module';
import { VerificationService } from './verification.service';

@Module({
  imports: [BybitModule, StorageModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
