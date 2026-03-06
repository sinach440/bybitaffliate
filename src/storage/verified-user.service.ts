import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerifiedUser } from './entities/verified-user.entity';

@Injectable()
export class VerifiedUserService {
  constructor(
    @InjectRepository(VerifiedUser)
    private readonly repo: Repository<VerifiedUser>,
  ) {}

  async isVerified(uid: string): Promise<boolean> {
    const normalized = String(uid).trim();
    const one = await this.repo.findOne({ where: { uid: normalized } });
    return one != null;
  }

  async markVerified(uid: string, telegramId?: string): Promise<VerifiedUser> {
    const normalized = String(uid).trim();
    let row = await this.repo.findOne({ where: { uid: normalized } });
    if (row) return row;
    row = this.repo.create({ uid: normalized, telegramId: telegramId ?? null });
    return this.repo.save(row);
  }
}
