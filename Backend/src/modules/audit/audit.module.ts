import { Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  providers: [AuditService, PrismaService],
  exports: [AuditService],
})
export class AuditModule {}
