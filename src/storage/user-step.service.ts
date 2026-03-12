import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStep, type Step } from './entities/user-step.entity';

const REMINDER_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class UserStepService {
  constructor(
    @InjectRepository(UserStep)
    private readonly repo: Repository<UserStep>,
  ) {}

  /** Set or update the user's step (resets reminder window). */
  async setStep(telegramId: string, step: Step): Promise<UserStep> {
    const id = String(telegramId);
    const now = new Date();
    let row = await this.repo.findOne({ where: { telegramId: id } });
    if (row) {
      row.step = step;
      row.stepUpdatedAt = now;
      row.reminderSentAt = null;
      return this.repo.save(row);
    }
    row = this.repo.create({
      telegramId: id,
      step,
      stepUpdatedAt: now,
      reminderSentAt: null,
    });
    return this.repo.save(row);
  }

  /** Users at a non-verified step who are due for a reminder: first time 24h after step, then every 24h until they complete. */
  async findDueForReminder(): Promise<UserStep[]> {
    const cutoff = new Date(Date.now() - REMINDER_AFTER_MS);
    return this.repo
      .createQueryBuilder('u')
      .where('u.step != :verified', { verified: 'verified' })
      .andWhere('u.step_updated_at <= :cutoff', { cutoff })
      .andWhere(
        '(u.reminder_sent_at IS NULL OR u.reminder_sent_at <= :cutoff)',
        { cutoff },
      )
      .orderBy('u.step_updated_at', 'ASC')
      .getMany();
  }

  async markReminderSent(id: number): Promise<void> {
    await this.repo.update(id, { reminderSentAt: new Date() });
  }
}
