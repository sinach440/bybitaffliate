import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PendingUidRequest } from './entities/pending-uid-request.entity';

const REMINDER_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class PendingUidRequestService {
  constructor(
    @InjectRepository(PendingUidRequest)
    private readonly repo: Repository<PendingUidRequest>,
  ) {}

  /** Record that we asked this user for their UID (or refresh askedAt). */
  async createOrRefresh(telegramId: string): Promise<PendingUidRequest> {
    const id = String(telegramId);
    let row = await this.repo.findOne({ where: { telegramId: id } });
    if (row) {
      row.askedAt = new Date();
      row.reminderSentAt = null;
      return this.repo.save(row);
    }
    row = this.repo.create({ telegramId: id });
    return this.repo.save(row);
  }

  /** User took action (sent a UID); clear pending. */
  async clear(telegramId: string): Promise<void> {
    await this.repo.delete({ telegramId: String(telegramId) });
  }

  /** Pending requests that are 24h+ old and reminder not yet sent. */
  async findDueForReminder(): Promise<PendingUidRequest[]> {
    const cutoff = new Date(Date.now() - REMINDER_AFTER_MS);
    return this.repo
      .createQueryBuilder('p')
      .where('p.reminder_sent_at IS NULL')
      .andWhere('p.asked_at <= :cutoff', { cutoff })
      .orderBy('p.asked_at', 'ASC')
      .getMany();
  }

  async markReminderSent(id: number): Promise<void> {
    await this.repo.update(id, { reminderSentAt: new Date() });
  }
}
