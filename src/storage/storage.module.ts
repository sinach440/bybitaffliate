import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingUidRequest } from './entities/pending-uid-request.entity';
import { UserStep } from './entities/user-step.entity';
import { VerifiedUser } from './entities/verified-user.entity';
import { PendingUidRequestService } from './pending-uid-request.service';
import { UserStepService } from './user-step.service';
import { VerifiedUserService } from './verified-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerifiedUser, PendingUidRequest, UserStep]),
  ],
  providers: [VerifiedUserService, PendingUidRequestService, UserStepService],
  exports: [VerifiedUserService, PendingUidRequestService, UserStepService],
})
export class StorageModule {}
