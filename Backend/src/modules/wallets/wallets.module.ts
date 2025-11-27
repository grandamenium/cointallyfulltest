import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { PrismaService } from '../../common/services/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { CsvParserService } from './csv-parser.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sync-queue',
    }),
  ],
  controllers: [WalletsController],
  providers: [WalletsService, PrismaService, EncryptionService, CsvParserService],
  exports: [WalletsService],
})
export class WalletsModule {}
