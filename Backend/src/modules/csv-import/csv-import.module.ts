import { Module } from '@nestjs/common';
import { CsvImportController } from './csv-import.controller';
import { CsvImportService } from './services/csv-import.service';
import { TransactionsModule } from '../transactions/transactions.module';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  imports: [TransactionsModule],
  controllers: [CsvImportController],
  providers: [CsvImportService, PrismaService],
  exports: [CsvImportService],
})
export class CsvImportModule {}
