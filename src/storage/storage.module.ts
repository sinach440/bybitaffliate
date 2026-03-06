import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingUidRequest } from './entities/pending-uid-request.entity';
import { VerifiedUser } from './entities/verified-user.entity';
import { PendingUidRequestService } from './pending-uid-request.service';
import { VerifiedUserService } from './verified-user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerifiedUser, PendingUidRequest]),
  ],
  providers: [VerifiedUserService, PendingUidRequestService],
  exports: [VerifiedUserService, PendingUidRequestService],
})
export class StorageModule {}
