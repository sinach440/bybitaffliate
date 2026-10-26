import { Injectable } from '@nestjs/common';
import { BybitService } from '../bybit/bybit.service';
import { VerifiedUserService } from '../storage/verified-user.service';

export type VerificationStatus =
  | 'NOT_REGISTERED'
  | 'INSUFFICIENT_FUNDS'
  | 'APPROVED';

export interface VerificationResult {
  status: VerificationStatus;
  /** True when UID was already in storage – Elite Group link must not be sent again. */
  alreadyVerified?: boolean;
}

/** Minimum deposit (USDT) required to join the Elite group. */
export const MIN_DEPOSIT_USDT = 10;

/**
 * Eligibility uses Bybit deposit totals (depositAmount30Day / depositAmount365Day).
 * Wallet balance is only a tier ("1" = <100 USDT), so it cannot confirm a $10 deposit.
 * A tier of 2+ still qualifies, because that account already holds at least 100 USDT.
 */
@Injectable()
export class VerificationService {
  constructor(
    private bybit: BybitService,
    private verifiedUser: VerifiedUserService,
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

    if (!this.bybit.hasMinDeposit(info, MIN_DEPOSIT_USDT)) {
      return { status: 'INSUFFICIENT_FUNDS' };
    }

    return { status: 'APPROVED', alreadyVerified: false };
  }
}
