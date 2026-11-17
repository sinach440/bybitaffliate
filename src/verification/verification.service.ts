import { Injectable } from '@nestjs/common';
import { BybitService } from '../bybit/bybit.service';
import { VerifiedUserService } from '../storage/verified-user.service';
import { BotSettingsService } from '../settings/bot-settings.service';

export type VerificationStatus =
  | 'NOT_REGISTERED'
  | 'INSUFFICIENT_FUNDS'
  | 'APPROVED';

export interface VerificationResult {
  status: VerificationStatus;
  /** True when UID was already in storage – Elite Group link must not be sent again. */
  alreadyVerified?: boolean;
}

/**
 * Eligibility uses Bybit deposit totals (depositAmount30Day / depositAmount365Day).
 * Wallet balance is only a tier, so it is a fallback for deposits of 100+ USDT.
 * Thresholds come from BotSettingsService (MIN_DEPOSIT_USDT, MIN_TRADE_VOLUME_USDT).
 */
@Injectable()
export class VerificationService {
  constructor(
    private bybit: BybitService,
    private verifiedUser: VerifiedUserService,
    private settings: BotSettingsService,
  ) {}

  async verify(uid: string): Promise<VerificationResult> {
    const normalized = String(uid).trim();

    if (await this.verifiedUser.isVerified(normalized)) {
      return { status: 'APPROVED', alreadyVerified: true };
    }

    const info = await this.bybit.getAffiliateCustomerInfo(normalized);

    if (!info) {
      return { status: 'NOT_REGISTERED' };
    }

    if (
      !this.bybit.hasMinDeposit(info, this.settings.minDepositUsdt) ||
      !this.bybit.hasMinTradeVolume(info, this.settings.minTradeVolumeUsdt)
    ) {
      return { status: 'INSUFFICIENT_FUNDS' };
    }

    return { status: 'APPROVED', alreadyVerified: false };
  }
}
